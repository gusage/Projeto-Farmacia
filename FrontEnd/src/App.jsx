// frontend/src/App.jsx
import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ColetaForm from './pages/ColetaForm';
import AnaliseLaudos from './pages/AnaliseLaudos';

export default function App() {
    const { authenticated, loading, user, logout } = useContext(AuthContext);
    const usuarioLogado = user;
    const [telaAtual, setTelaAtual] = useState('coleta'); // Estado para controlar a tela atual

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

    // Função que será disparada ao clicar em "Sair"
    const handleLogout = () => {
        // 1. Limpa os dados do localStorage/sessionStorage (se estiver usando)
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        // 2. Desasautentica no estado do React para voltar à tela de login
        logout();
        
        // Opcional: força voltar para a aba inicial
        setTelaAtual('coleta');
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* PASSADO: usuarioLogado enviado como Prop para controle visual */}
            <Navbar 
                telaAtual={telaAtual} 
                setTelaAtual={setTelaAtual} 
                onLogout={handleLogout} 
                usuarioLogado={usuarioLogado} 
            />

            <div className="bg-slate-800 text-slate-300 py-1.5 px-4 text-center text-xs font-medium border-b border-slate-700">
                Conectado como: <strong className="text-white">{usuarioLogado.nome}</strong> ({usuarioLogado.role})
            </div>

            <main>
                {/* Rota Livre para todos */}
                {telaAtual === 'coleta' && <ColetaForm />}
                
                {/* Rota Protegida: Só renderiza se for farmacêutica */}
                {telaAtual === 'analise' && (
                    usuarioLogado?.role?.toLowerCase() === 'farmaceutica' ? (
                        <AnaliseLaudos />
                    ) : (
                        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow border border-rose-100 text-center">
                            <span className="text-4xl">🚫</span>
                            <h2 className="text-lg font-bold text-slate-800 mt-2">Acesso Negado</h2>
                            <p className="text-sm text-slate-500 mt-1">Este perfil não possui permissões regulatórias para validar laudos.</p>
                        </div>
                    )
                )}
            </main>
        </div>
    );
}