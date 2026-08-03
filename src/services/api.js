const BASE_URL = 'http://localhost:8000';

export const api = {
  /**
   * Helper for making API requests with automatic JWT injection
   */
  request: async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
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
    return api.request(`/live/?limit=${limit}`);
  },

  getMovies: (limit = 50) => {
    return api.request(`/movies/?limit=${limit}`);
  },
  
  getStreamUrl: (type, id) => {
    const token = localStorage.getItem('token');
    return `${BASE_URL}/stream/${type}/${id}?token=${token}`;
  }
};
