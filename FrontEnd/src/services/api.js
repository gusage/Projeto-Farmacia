// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Injeta o token em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_farmacia');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trata erros globais de resposta
api.interceptors.response.use(
  (response) => response, // sucesso — passa direto
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido — limpa a sessão e redireciona
      localStorage.removeItem('token_farmacia');
      localStorage.removeItem('user_farmacia');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
