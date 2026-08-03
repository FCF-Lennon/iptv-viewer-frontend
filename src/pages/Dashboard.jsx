import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [channels, setChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Fetch Live and VOD in parallel
        const [liveData, vodData] = await Promise.all([
          api.getLiveChannels(15),
          api.getMovies(15)
        ]);
        setChannels(liveData || []);
        setMovies(vodData || []);
      } catch (err) {
        if (err.message && err.message.includes('Credenciales Xtream no configuradas')) {
          setNeedsSetup(true);
        } else {
          setError(err.message || 'Error al cargar contenido');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handlePlayLive = (id) => {
    navigate(`/player/live/${id}`);
  };

  const handlePlayMovie = (id) => {
    navigate(`/player/movie/${id}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="dashboard-container" style={{ alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 150px)' }}>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(15,15,20,0.8)', borderRadius: '16px', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>¡Bienvenido a IPTV Viewer!</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem', lineHeight: '1.5' }}>Para empezar a ver tu contenido, necesitas configurar las credenciales de tu proveedor Xtream Codes.</p>
          <button className="btn-primary" onClick={() => navigate('/settings')}>
            Configurar Xtream Codes
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Banner Principal Dinámico */}
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-dot"></span> EN VIVO AHORA
          </div>
          <h1 className="hero-title">UEFA Champions League<br/>Gran Final 2026</h1>
          <p className="hero-desc">Disfruta del partido más importante del año en calidad 4K HDR. La tensión está al máximo y ambos equipos buscan la gloria eterna.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => handlePlay(1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Ver Ahora
            </button>
            <button className="btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Más info
            </button>
          </div>
        </div>
      </section>

      {/* Fila de Canales en Vivo (EPG Style) */}
      <section className="content-row">
        <div className="row-header">
          <h2>TV en Vivo</h2>
          <button className="btn-link">Guía Completa</button>
        </div>
        <div className="scroll-container">
          {channels.map(channel => (
            <div key={channel.stream_id} className="card-channel" onClick={() => handlePlayLive(channel.stream_id)}>
              <div className="card-img-wrapper">
                <img src={channel.stream_icon || 'https://placehold.co/400x225/111/222?text=No+Image'} alt={channel.name} loading="lazy" />
                <div className="play-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="card-epg-info">
                <div className="channel-header">
                  <span className="channel-name">{channel.name}</span>
                </div>
                {channel.epg && channel.epg.title ? (
                   <>
                     <h3 className="program-title">{channel.epg.title}</h3>
                     <div className="epg-progress-bg">
                       <div className="epg-progress-fill" style={{ width: `${channel.epg.progress}%` }}></div>
                     </div>
                   </>
                ) : (
                   <h3 className="program-title" style={{ color: '#71717a' }}>Sin información EPG</h3>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fila de Películas (VOD) */}
      <section className="content-row">
        <div className="row-header">
          <h2>Agregados Recientemente</h2>
          <button className="btn-link">Ver todo el catálogo</button>
        </div>
        <div className="scroll-container">
          {movies.map(movie => (
            <div key={movie.stream_id} className="card-vod" onClick={() => handlePlayMovie(movie.stream_id)}>
              <div className="card-img-wrapper">
                <img src={movie.stream_icon || 'https://placehold.co/300x450/111/222?text=No+Poster'} alt={movie.name} loading="lazy" />
                <div className="play-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="card-info">
                <h3>{movie.name}</h3>
                <span className="movie-category">{movie.category_id}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
