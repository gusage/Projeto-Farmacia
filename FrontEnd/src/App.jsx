// frontend/src/App.jsx
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';

export default function App() {
    const { authenticated, loading, user, logout } = useContext(AuthContext);

    // Se estiver checando o localStorage ao abrir o app, exibe uma tela de carregamento
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 animate-pulse">Carregando ambiente seguro...</p>
            </div>
        );
    }

    // Se NÃO estiver autenticado, exibe obrigatoriamente a tela de Login
    if (!authenticated) {
        return <Login />;
    }

    // Se ESTIVER autenticado, exibe o painel principal do sistema (Provisório para teste)
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Bem-vinda, {user.nome}!</h1>
            <p className="text-gray-600">Nível de acesso: <span className="font-semibold">{user.role}</span></p>
            
            <button 
                onClick={logout}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
                Sair do Sistema
            </button>
        </div>
    );
}
