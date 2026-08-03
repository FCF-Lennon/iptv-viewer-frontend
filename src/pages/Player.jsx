import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import mpegts from 'mpegts.js';
import Hls from 'hls.js';
import { api } from '../services/api';
import './Player.css';

export default function Player() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const mediaPlayerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  
  // Estados reactivos del video
  const [isPlaying, setIsPlaying] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Metadatos
  const [metadata, setMetadata] = useState({
    title: `Cargando...`,
    poster: null,
    plot: null
  });

  // 1. Cargar Metadatos
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        if (type === 'movie') {
          const info = await api.getMovieInfo(id);
          setMetadata({
            title: info.title || `Película ${id}`,
            poster: info.poster,
            plot: info.description
          });
        } else if (type === 'live') {
          // Buscamos en el listado
          const channels = await api.getLiveChannels(5000);
          const channel = channels.find(c => c.id.toString() === id.toString());
          if (channel) {
            setMetadata({
              title: channel.title || `Canal ${id}`,
              poster: channel.poster,
              plot: null
            });
          } else {
            setMetadata({ title: `Canal ${id}` });
          }
        } else if (type === 'series') {
          const series = await api.getSeries(5000);
          const s = series.find(s => s.id.toString() === id.toString());
          if (s) {
            setMetadata({
              title: s.title || `Serie ${id}`,
              poster: s.poster,
              plot: s.description
            });
          } else {
            setMetadata({ title: `Episodio ${id}` });
          }
        }
      } catch (e) {
        console.error("Error al cargar metadatos", e);
        setMetadata({ title: type === 'live' ? `Canal ${id}` : `Contenido ${id}` });
      }
    };
    fetchMetadata();
  }, [id, type]);

  // 2. Inicializar Reproductor
  useEffect(() => {
    setLoading(true);
    setError(null);
    const streamUrl = api.getStreamUrl(type, id);
    const videoElement = videoRef.current;

    const initializePlayer = async () => {
      if (!videoElement) return;

      if (type === 'live') {
        if (mpegts.isSupported()) {
          const player = mpegts.createPlayer({
            type: 'm2ts',
            isLive: true,
            url: streamUrl,
          });
          mediaPlayerRef.current = player;
          player.attachMediaElement(videoElement);
          player.load();
          player.play().catch(err => console.log("Autoplay was prevented:", err));
          player.on(mpegts.Events.ERROR, (errType, errDetail) => {
            console.error("MPEGTS Error:", errType, errDetail);
            setError("Error decodificando el stream en vivo. Verifica tu conexión.");
          });
        } else {
          setError("Navegador no soporta MSE para TV en vivo.");
        }
      } else {
        // VOD (HLS)
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxMaxBufferLength: 120,
            maxBufferSize: 60 * 1000 * 1000, 
          });
          mediaPlayerRef.current = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch(err => console.log("Autoplay was prevented:", err));
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) setError("Error de red.");
              else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
              else setError("Error inesperado en HLS.");
            }
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.src = streamUrl;
          videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(err => console.log("Autoplay was prevented:", err));
          });
        } else {
          setError("Tu navegador no soporta reproducción HLS.");
        }
      }
      setLoading(false);
    };

    initializePlayer();

    return () => {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.destroy();
        mediaPlayerRef.current = null;
      }
    };
  }, [id, type]);

  // 3. Gestión de Ocultar Controles (Idle Timeout)
  useEffect(() => {
    const resetControls = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
      }
    };

    window.addEventListener('mousemove', resetControls);
    window.addEventListener('keydown', resetControls);
    resetControls();

    return () => {
      window.removeEventListener('mousemove', resetControls);
      window.removeEventListener('keydown', resetControls);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // 4. Eventos de Video Nativos
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };
    const onWaiting = () => setIsWaiting(true);
    const onPlaying = () => setIsWaiting(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, []);

  // 5. Controladores de Acciones
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
      }
    }
  };

  const handleSeek = (e) => {
    if (type === 'live') return;
    const seekTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.player-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 6. Helpers de UI
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`player-container ${!showControls && isPlaying ? 'hide-cursor' : ''}`}>
      
      {/* Video Overlay Info / Errores */}
      {(loading || error || isWaiting) && (
        <div className="player-feedback-layer">
          {(loading || isWaiting) && !error && (
            <div className="feedback-box">
              <div className="loading-spinner large-spinner"></div>
            </div>
          )}
          {error && (
            <div className="feedback-box error-box">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
               </svg>
              <h3>Error de Reproducción</h3>
              <p>{error}</p>
              <button className="btn-secondary" onClick={() => navigate(-1)}>Volver</button>
            </div>
          )}
        </div>
      )}

      {/* Video Element */}
      <div className="video-layer" onClick={togglePlay}>
        <video 
          ref={videoRef}
          className="video-element" 
          autoPlay 
          controls={false}
          playsInline
        />
      </div>

      {/* Interfaz de Controles */}
      <div className={`player-ui ${showControls || !isPlaying ? 'visible' : ''}`}>
        
        {/* Barra Superior */}
        <div className="player-top-bar glass-effect">
          <button className="btn-icon" onClick={() => navigate(-1)} title="Volver">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          
          <div className="channel-meta">
            <h2>{metadata.title}</h2>
            {type === 'live' && <span className="live-badge pulse">EN VIVO</span>}
          </div>
        </div>

        {/* Capa de Información Central (Opcional, cuando está en pausa) */}
        {!isPlaying && metadata.plot && (
          <div className="player-pause-overlay animate-fade">
            <div className="pause-info">
              <h3>{metadata.title}</h3>
              <p>{metadata.plot.length > 300 ? metadata.plot.substring(0, 300) + '...' : metadata.plot}</p>
            </div>
          </div>
        )}

        {/* Barra Inferior de Controles */}
        <div className="player-bottom-bar glass-effect">
          
          {/* Progress Bar (Solo VOD) */}
          {type !== 'live' && (
            <div className="progress-container">
              <span className="time-text">{formatTime(currentTime)}</span>
              <input 
                type="range" 
                className="progress-slider"
                min="0" 
                max="100" 
                value={progress}
                onChange={handleSeek}
                style={{ '--progress': `${progress}%` }}
              />
              <span className="time-text">{formatTime(duration)}</span>
            </div>
          )}

          <div className="controls-row">
            <div className="controls-left">
              <button className="control-btn play-btn" title={isPlaying ? "Pausar" : "Reproducir"} onClick={togglePlay}>
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>

              <div className="volume-container">
                <button className="control-btn" onClick={toggleMute} title="Silenciar">
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                      <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  )}
                </button>
                <input 
                  type="range" 
                  className="volume-slider" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  style={{ '--volume-progress': `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            <div className="controls-right">
              <button className="control-btn" title="Pantalla Completa" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
