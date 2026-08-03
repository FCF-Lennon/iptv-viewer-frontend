import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mpegts from 'mpegts.js';
import Hls from 'hls.js';
import { api } from '../services/api';
import './Player.css';

export default function Player() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaPlayerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);

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
            setError("Error decodificando el stream. Puede que no esté activo.");
          });
        } else {
          setError("Tu navegador no soporta la tecnología (MSE) para reproducir TV en vivo.");
        }
      } else if (type === 'movie' || type === 'series') {
        if (Hls.isSupported()) {
          const hls = new Hls({
            // Configuración de HLS para robustez
            maxMaxBufferLength: 120, // Aumenta el buffer máximo
            maxBufferSize: 60 * 1000 * 1000, // 60MB
          });
          mediaPlayerRef.current = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch(err => console.log("Autoplay was prevented:", err));
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('HLS Error:', data);
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setError("Error de red. Verifica tu conexión e intenta de nuevo.");
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setError("Error con el video. Puede estar corrupto o en un formato no soportado.");
                  hls.recoverMediaError();
                  break;
                default:
                  setError("Ocurrió un error inesperado al cargar el video.");
                  break;
              }
            }
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          // Soporte nativo de HLS en Safari
          videoElement.src = streamUrl;
          videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(err => console.log("Autoplay was prevented:", err));
          });
        } else {
          setError("Tu navegador no soporta HLS para la reproducción de este contenido.");
        }
      }
      setLoading(false);
    };

    initializePlayer();

    let timeout;
    const resetControlsTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', resetControlsTimeout);
    resetControlsTimeout();

    return () => {
      window.removeEventListener('mousemove', resetControlsTimeout);
      clearTimeout(timeout);
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.destroy();
        mediaPlayerRef.current = null;
      }
    };
  }, [id, type]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = () => {
    const playerContainer = document.querySelector('.player-container');
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch(err => {
        console.error(`Error al intentar activar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'live': return 'Canal';
      case 'movie': return 'Película';
      case 'series': return 'Episodio';
      default: return 'Contenido';
    }
  }

  return (
    <div className="player-container">
      {(loading || error) && (
        <div className="player-feedback-layer">
          {loading && (
            <div className="feedback-box">
              <div className="loading-spinner"></div>
              <p>Conectando al stream...</p>
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

      {/* Elemento de Video Real */}
      <div className="video-layer">
        <video 
          ref={videoRef}
          className="video-element" 
          autoPlay 
          controls={false}
        />
      </div>

      {/* Controles y Overlays */}
      <div className={`player-ui ${showControls ? 'visible' : ''}`}>
        
        <div className="player-top-bar glass-effect">
          <button className="btn-icon" onClick={() => navigate(-1)} title="Volver">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div className="channel-meta">
            <h2>{getTitle()} ID: {id}</h2>
            {type === 'live' && <span className="live-badge">EN VIVO</span>}
          </div>
        </div>

        <div className="player-controls glass-effect">
          <button className="control-btn" title="Pausar/Reproducir" onClick={togglePlay}>
            {videoRef.current?.paused ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            )}
          </button>
          
          <button className="control-btn" title="Pantalla Completa" onClick={toggleFullscreen}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
