import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [channels, setChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulando carga de datos EPG (Guía de programación electrónica) y contenido VOD
    setTimeout(() => {
      setChannels([
        { 
          id: 1, 
          name: 'Deportes Premium', 
          logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=250&auto=format&fit=crop',
          currentProgram: 'UEFA Champions League: Final',
          progress: 65,
          time: '14:00 - 16:30'
        },
        { 
          id: 2, 
          name: 'Noticias 24', 
          logo: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=250&auto=format&fit=crop',
          currentProgram: 'Edición Central',
          progress: 80,
          time: '21:00 - 22:30'
        },
        { 
          id: 3, 
          name: 'Cine Max', 
          logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=250&auto=format&fit=crop',
          currentProgram: 'Interstellar',
          progress: 30,
          time: '20:00 - 23:00'
        },
        { 
          id: 4, 
          name: 'Música Hit', 
          logo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=250&auto=format&fit=crop',
          currentProgram: 'Top 50 Global',
          progress: 15,
          time: '18:00 - 20:00'
        },
        { 
          id: 5, 
          name: 'Naturaleza', 
          logo: 'https://images.unsplash.com/photo-1518182170546-076616fd4aa5?q=80&w=250&auto=format&fit=crop',
          currentProgram: 'Planeta Tierra II',
          progress: 45,
          time: '19:00 - 20:00'
        }
      ]);
      
      setMovies([
        { id: 101, title: 'Dune: Part Two', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop', category: 'Ciencia Ficción' },
        { id: 102, title: 'Oppenheimer', img: 'https://images.unsplash.com/photo-1440407876336-62333a6f010f?q=80&w=300&auto=format&fit=crop', category: 'Drama' },
        { id: 103, title: 'Barbie', img: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=300&auto=format&fit=crop', category: 'Comedia' },
        { id: 104, title: 'Spider-Man', img: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=300&auto=format&fit=crop', category: 'Acción' },
        { id: 105, title: 'Wonka', img: 'https://images.unsplash.com/photo-1517409241951-64d85a0ca797?q=80&w=300&auto=format&fit=crop', category: 'Fantasía' },
        { id: 106, title: 'Killers of the Flower Moon', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&auto=format&fit=crop', category: 'Crimen' }
      ]);
      
      setLoading(false);
    }, 800);
  }, []);

  const handlePlay = (id) => {
    navigate(`/player/${id}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
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
            <div key={channel.id} className="card-channel" onClick={() => handlePlay(channel.id)}>
              <div className="card-img-wrapper">
                <img src={channel.logo} alt={channel.name} loading="lazy" />
                <div className="play-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="card-epg-info">
                <div className="channel-header">
                  <span className="channel-name">{channel.name}</span>
                  <span className="channel-time">{channel.time}</span>
                </div>
                <h3 className="program-title">{channel.currentProgram}</h3>
                <div className="epg-progress-bg">
                  <div className="epg-progress-fill" style={{ width: `${channel.progress}%` }}></div>
                </div>
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
            <div key={movie.id} className="card-vod" onClick={() => handlePlay(movie.id)}>
              <div className="card-img-wrapper">
                <img src={movie.img} alt={movie.title} loading="lazy" />
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
