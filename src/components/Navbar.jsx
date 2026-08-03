import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: 'Inicio' },
    { path: '/live', label: 'TV en Vivo' },
    { path: '/movies', label: 'Películas' },
    { path: '/series', label: 'Series' }
  ];

  return (
    <nav className="navbar glass">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <h1>IPTV<span className="accent">VIEWER</span></h1>
        </Link>
      </div>

      <div className="navbar-links">
        {navLinks.map(link => (
          <Link 
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-avatar">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </span>
          <span className="user-name">{user?.username || 'Usuario'}</span>
        </div>
        <button onClick={logout} className="btn-logout" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </nav>
  );
}
