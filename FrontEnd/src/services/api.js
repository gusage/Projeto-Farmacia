// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

// Middleware no Frontend: Adiciona o Token JWT automaticamente em todas as requisições se ele existir
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token_farmacia');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
