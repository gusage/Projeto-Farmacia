// frontend/src/pages/Login.jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const { login } = useContext(AuthContext);
    
    // Estados locais para capturar os dados do formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        // Chame a função de login do nosso Contexto (que bate na porta 3000)
        const resultado = await login(email, password);

        if (!resultado.success) {
            setErro(resultado.message);
            setCarregando(false);
        } else {
            // Se der certo, o Contexto muda o estado e o app redireciona
            console.log("Logado com sucesso!");
        }
    };

    return (
        // Container principal: Centraliza tudo na tela e muda o fundo
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            
            {/* Caixa do Formulário: Alarga no Desktop (max-w-md) e fica cheia no celular */}
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                
                {/* Cabeçalho / Identidade Visual */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                        🔬
                    </div>
                    <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        BioCount
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Sistema de Monitoramento Ambiental
                    </p>
                </div>

                {/* Formulário */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Alerta de Erro vindo do Backend (se houver) */}
                    {erro && (
                        <div className="p-3 rounded-md bg-red-50 text-sm text-red-600 border border-red-200">
                            ⚠️ {erro}
                        </div>
                    )}

                    <div className="rounded-md space-y-4">
                        {/* Campo E-mail */}
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail Institucional
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="exemplo@farmacia.com"
                            />
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Senha de Acesso
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Botão de Enviar (Aumenta a área de clique no mobile para facilitar o toque) */}
                    <div>
                        <button
                            type="submit"
                            disabled={carregando}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                        >
                            {carregando ? 'Validando credenciais...' : 'Entrar no Sistema'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
