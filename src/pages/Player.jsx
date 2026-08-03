import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Player.css';

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channelInfo, setChannelInfo] = useState(null);
  
  // UI States para los controles
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // Simular carga de stream de video
    setTimeout(() => {
      setChannelInfo({
        name: id == 2 ? 'Deportes Pro' : 'Canal ' + id,
        currentProgram: id == 2 ? 'Gran Final del Campeonato' : 'Programa en vivo',
        time: '20:00 - 22:30'
      });
      setLoading(false);
    }, 1000);

    // Ocultar controles automáticamente después de 3 segundos
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
    };
  }, [id]);

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
      {/* Simulación del elemento de Video */}
      <div className="video-layer">
        <img src="https://placehold.co/1920x1080/111/222?text=Video+Player" alt="Video Stream" className="video-placeholder" />
      </div>

      {/* Controles y Overlays */}
      <div className={`player-ui ${showControls ? 'visible' : 'hidden'}`}>
        
        {/* Barra superior: Volver y título del canal */}
        <div className="player-top-bar glass">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div className="channel-meta">
            <h2>{channelInfo?.name}</h2>
            <span className="live-badge">EN VIVO</span>
          </div>
        </div>

        {/* Información del programa actual (Bottom Left) */}
        <div className="player-bottom-info glass">
          <h3>{channelInfo?.currentProgram}</h3>
          <p>{channelInfo?.time}</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Controles de reproducción (Bottom Right) */}
        <div className="player-controls glass">
          <button className="control-btn" title="Pausar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <button className="control-btn" title="Volumen">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
          <button className="control-btn" title="Pantalla Completa">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
