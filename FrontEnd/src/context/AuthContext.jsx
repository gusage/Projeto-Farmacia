/* eslint-disable react-refresh/only-export-components */
// frontend/src/context/AuthContext.jsx
import { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    // Inicialize o usuário a partir do localStorage de forma síncrona para evitar definir o estado dentro de um efeito.
    const [user, setUser] = useState(() => {
        try {
            const token = localStorage.getItem('token_farmacia');
            const usuarioSalvo = localStorage.getItem('user_farmacia');
            if (token && usuarioSalvo) {
                return JSON.parse(usuarioSalvo);
            }
        } catch (e) {
            console.error('Failed to parse user data:', e);
        }
        return null;
    });

    const login = async (email, password) => {
        try {
            // Chama o nosso backend na porta 3000
            const response = await api.post('/auth/login', { email, password });
            const { token, user: loggedUser } = response.data;

            // Salva os dados no navegador para não deslogar ao dar F5
            localStorage.setItem('token_farmacia', token);
            localStorage.setItem('user_farmacia', JSON.stringify(loggedUser));

            setUser(loggedUser);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Erro ao conectar com o servidor." 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token_farmacia');
        localStorage.removeItem('user_farmacia');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, authenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
