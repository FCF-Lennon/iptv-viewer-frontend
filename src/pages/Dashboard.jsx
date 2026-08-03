import { useEffect, useState, useRef } from 'react';
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

  // Refs para el scroll horizontal
  const liveScrollRef = useRef(null);
  const moviesScrollRef = useRef(null);

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

  // Funciones para scroll con arrastre de ratón
  const handleMouseDown = (e, ref) => {
    if (!ref.current) return;
    ref.current.isDown = true;
    ref.current.startX = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeftStart = ref.current.scrollLeft;
    ref.current.style.cursor = 'grabbing';
    ref.current.style.scrollBehavior = 'auto'; // desactiva smooth para que no haya lag
  };

  const handleMouseLeaveOrUp = (ref) => {
    if (!ref.current) return;
    ref.current.isDown = false;
    ref.current.style.cursor = 'auto';
    ref.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseMove = (e, ref) => {
    if (!ref.current || !ref.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - ref.current.startX) * 1.5; // Multiplicador de velocidad
    ref.current.scrollLeft = ref.current.scrollLeftStart - walk;
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
      {movies.length > 0 && (
        <section className="hero-banner">
          <div 
            className="hero-bg-layer"
            style={{ backgroundImage: `url(${movies[0].poster || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20'})` }}
          ></div>
          <div className="hero-overlay"></div>
          
          <div className="hero-content">
            <span className="hero-badge">DESTACADO</span>
            <h1 className="hero-title">{movies[0].title}</h1>
            <p className="hero-desc">Disfruta de este título y miles más en nuestra biblioteca de Video on Demand, siempre disponible en máxima calidad.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => handlePlayMovie(movies[0].id)}>
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
                Más Info
              </button>
            </div>
          </div>

          <img 
            src={movies[0].poster} 
            alt={movies[0].title}
            className="hero-floating-poster"
            onError={(e) => e.target.style.display = 'none'}
          />
        </section>
      )}

      {/* Fila de Canales en Vivo (EPG Style) */}
      <section className="content-row">
        <div className="row-header">
          <h2>TV en Vivo</h2>
          <button className="btn-link">Guía Completa</button>
        </div>
        <div 
          className="scroll-container"
          ref={liveScrollRef}
          onMouseDown={(e) => handleMouseDown(e, liveScrollRef)}
          onMouseLeave={() => handleMouseLeaveOrUp(liveScrollRef)}
          onMouseUp={() => handleMouseLeaveOrUp(liveScrollRef)}
          onMouseMove={(e) => handleMouseMove(e, liveScrollRef)}
        >
          {channels.map(channel => (
            <div key={channel.id} className="card-channel" onClick={() => handlePlayLive(channel.id)}>
              <div className="card-img-wrapper">
                <img 
                  src={channel.poster || 'https://placehold.co/400x225/111/222?text=Sin+Imagen'} 
                  alt={channel.title} 
                  loading="lazy" 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x225/111/222?text=Sin+Imagen'; }}
                />
                <div className="play-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="card-epg-info">
                <div className="channel-header">
                  <span className="channel-name">{channel.title}</span>
                </div>
                {/* Por ahora no tenemos EPG en la API, mostramos la categoría */}
                <h3 className="program-title" style={{ color: '#71717a', fontSize: '0.9rem' }}>
                  {channel.category || 'TV en Vivo'}
                </h3>
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
        <div 
          className="scroll-container"
          ref={moviesScrollRef}
          onMouseDown={(e) => handleMouseDown(e, moviesScrollRef)}
          onMouseLeave={() => handleMouseLeaveOrUp(moviesScrollRef)}
          onMouseUp={() => handleMouseLeaveOrUp(moviesScrollRef)}
          onMouseMove={(e) => handleMouseMove(e, moviesScrollRef)}
        >
          {movies.map(movie => (
            <div key={movie.id} className="card-vod" onClick={() => handlePlayMovie(movie.id)}>
              <div className="card-img-wrapper">
                <img 
                  src={movie.poster || 'https://placehold.co/300x450/111/222?text=Sin+Poster'} 
                  alt={movie.title} 
                  loading="lazy" 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x450/111/222?text=Sin+Poster'; }}
                />
                <div className="play-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="card-info">
                <h3>{movie.title}</h3>
                <span className="movie-category">{movie.category}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
