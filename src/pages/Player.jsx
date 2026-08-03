import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import mpegts from 'mpegts.js';
import { api } from '../services/api';
import './Player.css';

export default function Player() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const playerRef = useRef(null); // Ref for mpegts instance
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [showControls, setShowControls] = useState(true);
  
  const type = location.pathname.split('/')[2]; 

  useEffect(() => {
    setLoading(false);
    setError(null);
    const streamUrl = api.getStreamUrl(type, id);

    // Si es TV en Vivo, usamos mpegts para procesar el formato .ts
    if (type === 'live') {
      if (mpegts.getFeatureList().mseLivePlayback) {
        playerRef.current = mpegts.createPlayer({
          type: 'm2ts', // Formato nativo MPEG-TS de IPTV
          isLive: true,
          url: streamUrl,
        });
        
        playerRef.current.attachMediaElement(videoRef.current);
        playerRef.current.load();
        
        playerRef.current.on(mpegts.Events.ERROR, (errType, errDetail) => {
          console.error("MPEGTS Error:", errType, errDetail);
          setError("Error decodificando el stream. Verifica si está activo.");
        });

        const playPromise = playerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Auto-play was prevented", error);
          });
        }
      } else {
        setError("Tu navegador no soporta MSE (Media Source Extensions) para reproducir TV.");
      }
    }

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
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [id, type]);

  const streamUrl = api.getStreamUrl(type, id);

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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="player-loading">
        <div className="loading-spinner"></div>
        <p>Conectando al stream...</p>
      </div>
    );
  }

  return (
    <div className="player-container">
      {/* Elemento de Video Real conectado al Backend */}
      <div className="video-layer">
        <video 
          ref={videoRef}
          src={streamUrl} 
          className="video-element" 
          autoPlay 
          controls={false}
          onError={(e) => setError("Error al reproducir el formato de video. Es posible que el navegador no soporte este códec nativamente.")}
        />
      </div>

      {error && (
        <div className="player-error">
          <p>{error}</p>
        </div>
      )}

      {/* Controles y Overlays */}
      <div className={`player-ui ${showControls ? 'visible' : 'hidden'}`}>
        
        {/* Barra superior: Volver y título */}
        <div className="player-top-bar glass">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div className="channel-meta">
            <h2>Reproduciendo {type === 'live' ? 'Canal' : 'Película'} ID: {id}</h2>
            {type === 'live' && <span className="live-badge">EN VIVO</span>}
          </div>
        </div>

        {/* Controles de reproducción (Bottom Right) */}
        <div className="player-controls glass">
          <button className="control-btn" title="Pausar/Reproducir" onClick={togglePlay}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
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
