const BASE_URL = 'http://localhost:8000/api/v1';

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
  }
};
