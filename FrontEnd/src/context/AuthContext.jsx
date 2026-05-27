// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null); // null = sem valor padrão enganoso

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token_farmacia');
      const usuarioSalvo = localStorage.getItem('user_farmacia');
      if (token && usuarioSalvo) {
        // Injeta o token no axios já na inicialização (caso usuário já estava logado)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return JSON.parse(usuarioSalvo);
      }
    } catch (e) {
      console.error('Erro ao recuperar sessão:', e);
    }
    return null;
  });

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;

      localStorage.setItem('token_farmacia', token);
      localStorage.setItem('user_farmacia', JSON.stringify(loggedUser));

      // Injeta o token no axios para todas as requisições futuras
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar com o servidor.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token_farmacia');
    localStorage.removeItem('user_farmacia');

    // Remove o token do axios também
    delete api.defaults.headers.common['Authorization'];

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook próprio — importa só isso nos componentes
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
