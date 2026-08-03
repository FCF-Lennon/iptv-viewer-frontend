import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Settings.css';

export default function Settings() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    username: '',
    password: '',
    is_active: true
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const data = await api.getXtreamCredentials();
      setCredentials(data);
    } catch (err) {
      setError(err.message || 'Error cargando credenciales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.addXtreamCredentials(formData);
      setSuccess('Credenciales agregadas correctamente');
      setFormData({ name: '', host: '', username: '', password: '', is_active: true });
      fetchCredentials();
    } catch (err) {
      setError(err.message || 'Error al agregar credenciales');
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.activateXtreamCredential(id);
      fetchCredentials();
    } catch (err) {
      setError('Error al activar credencial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cuenta?')) return;
    try {
      await api.deleteXtreamCredential(id);
      fetchCredentials();
    } catch (err) {
      setError('Error al eliminar credencial');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Configuración Xtream Codes</h1>
        <p>Añade tus cuentas de proveedor IPTV para cargar los canales en el Dashboard.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="settings-grid">
        {/* Formulario Agregar */}
        <div className="settings-card glass">
          <h2>Añadir Nueva Cuenta</h2>
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label>Nombre (Alias)</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Ej: Mi Proveedor VIP" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Host / URL</label>
              <input 
                type="url" 
                name="host" 
                placeholder="http://dominio.com:8080" 
                value={formData.host}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Usuario</label>
              <input 
                type="text" 
                name="username" 
                placeholder="Tu usuario" 
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Tu contraseña" 
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-4">
              Guardar Cuenta
            </button>
          </form>
        </div>

        {/* Lista de Credenciales */}
        <div className="settings-card glass">
          <h2>Cuentas Guardadas</h2>
          {loading ? (
            <div className="settings-loading">Cargando...</div>
          ) : credentials.length === 0 ? (
            <div className="settings-empty">No tienes credenciales configuradas.</div>
          ) : (
            <div className="credentials-list">
              {credentials.map(cred => (
                <div key={cred.id} className={`credential-item ${cred.is_active ? 'active' : ''}`}>
                  <div className="cred-info">
                    <h3>{cred.name} {cred.is_active && <span className="badge-active">Activo</span>}</h3>
                    <p>{cred.host}</p>
                    <p className="cred-user">User: {cred.username}</p>
                  </div>
                  <div className="cred-actions">
                    {!cred.is_active && (
                      <button 
                        className="btn-activate" 
                        onClick={() => handleActivate(cred.id)}
                        title="Usar esta cuenta"
                      >
                        Activar
                      </button>
                    )}
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(cred.id)}
                      title="Eliminar cuenta"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
