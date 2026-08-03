import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [channels, setChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Aquí cargaríamos datos reales usando api.request()
    // Por ahora simularemos datos para maquetar el diseño premium
    
    setTimeout(() => {
      setChannels([
        { id: 1, name: 'Canal 1 HD', img: 'https://placehold.co/400x225/111/1ee37d?text=C1' },
        { id: 2, name: 'Deportes Pro', img: 'https://placehold.co/400x225/111/1ee37d?text=DEP' },
        { id: 3, name: 'Noticias 24/7', img: 'https://placehold.co/400x225/111/1ee37d?text=NOT' },
        { id: 4, name: 'Cine Premium', img: 'https://placehold.co/400x225/111/1ee37d?text=CINE' },
        { id: 5, name: 'Documentales', img: 'https://placehold.co/400x225/111/1ee37d?text=DOC' }
      ]);
      
      setMovies([
        { id: 101, title: 'El Gran Estreno', img: 'https://placehold.co/300x450/111/1ee37d?text=Peli+1' },
        { id: 102, title: 'Acción Sin Límite', img: 'https://placehold.co/300x450/111/1ee37d?text=Peli+2' },
        { id: 103, title: 'Comedia Familiar', img: 'https://placehold.co/300x450/111/1ee37d?text=Peli+3' },
        { id: 104, title: 'Terror Nocturno', img: 'https://placehold.co/300x450/111/1ee37d?text=Peli+4' },
        { id: 105, title: 'Sci-Fi Epic', img: 'https://placehold.co/300x450/111/1ee37d?text=Peli+5' },
        { id: 106, title: 'Romance Clásico', img: 'https://placehold.co/300x450/111/1ee37d?text=Peli+6' }
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
      {/* Banner Principal */}
      <section className="hero-banner glass">
        <div className="hero-content">
          <span className="badge">EN VIVO</span>
          <h1 className="hero-title">Gran Final del Campeonato</h1>
          <p className="hero-desc">No te pierdas el partido más esperado de la temporada. Transmisión exclusiva en 4K.</p>
          <button className="btn-primary" onClick={() => handlePlay(2)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Ver Ahora
          </button>
        </div>
      </section>

      {/* Fila de Canales en Vivo */}
      <section className="content-row">
        <div className="row-header">
          <h2>TV en Vivo</h2>
          <button className="btn-link">Ver todo</button>
        </div>
        <div className="scroll-container">
          {channels.map(channel => (
            <div key={channel.id} className="card-channel glass" onClick={() => handlePlay(channel.id)}>
              <div className="card-img-wrapper">
                <img src={channel.img} alt={channel.name} loading="lazy" />
                <div className="play-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className="card-info">
                <h3>{channel.name}</h3>
                <span className="live-indicator"></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fila de Películas (VOD) */}
      <section className="content-row">
        <div className="row-header">
          <h2>Películas Destacadas</h2>
          <button className="btn-link">Ver todo</button>
        </div>
        <div className="scroll-container">
          {movies.map(movie => (
            <div key={movie.id} className="card-vod glass" onClick={() => handlePlay(movie.id)}>
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
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
