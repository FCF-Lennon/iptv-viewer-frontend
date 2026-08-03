const BASE_URL = 'http://localhost:8000';

const memoryCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const api = {
  /**
   * Helper for making API requests with automatic JWT injection and optional caching
   */
  request: async (endpoint, options = {}, useCache = false) => {
    const token = localStorage.getItem('token');
    
    // Si se pide caché, revisar si existe y no ha expirado
    if (useCache && options.method !== 'POST' && options.method !== 'DELETE' && options.method !== 'PATCH') {
      const cached = memoryCache[endpoint];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en la petición');
      }

      // Guardar en caché si se solicitó
      if (useCache) {
        memoryCache[endpoint] = { data, timestamp: Date.now() };
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  login: (username, password) => {
    // El backend espera form-data para OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Credenciales inválidas');
      return data;
    });
  },

  getProfile: () => {
    return api.request('/auth/me');
  },

  // --- Xtream Credentials ---
  getXtreamCredentials: () => {
    return api.request('/auth/xtream');
  },
  
  addXtreamCredentials: (data) => {
    return api.request('/auth/xtream', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  activateXtreamCredential: (id) => {
    return api.request(`/auth/xtream/${id}/activate`, {
      method: 'PATCH'
    });
  },

  deleteXtreamCredential: (id) => {
    return api.request(`/auth/xtream/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Content ---
  getLiveChannels: (limit = 50) => {
    return api.request(`/live/?limit=${limit}`, {}, true);
  },

  getMovies: (limit = 50) => {
    return api.request(`/movies/?limit=${limit}`, {}, true);
  },
  
  getEpg: (streamId, limit = 5) => {
    return api.request(`/live/${streamId}/epg?limit=${limit}`, {}, false); // Not caching EPG because it changes often
  },
  
  getStreamUrl: (type, id) => {
    const token = localStorage.getItem('token');
    return `${BASE_URL}/stream/${type}/${id}?token=${token}`;
  }
};
