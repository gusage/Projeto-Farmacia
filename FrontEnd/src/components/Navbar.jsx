// frontend/src/components/Navbar.jsx
export default function Navbar({ telaAtual, setTelaAtual, onLogout, usuarioLogado }) {
    return (
        <nav className="bg-slate-900 text-white shadow-md border-b border-slate-800">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    
                    {/* Logo do Sistema */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTelaAtual('coleta')}>
                        <span className="text-2xl">🔬</span>
                        <span className="font-black tracking-wider text-emerald-400 text-lg font-mono">BioCount</span>
                    </div>

                    {/* Links de Navegação e Ações */}
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTelaAtual('coleta')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    telaAtual === 'coleta'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                📋 Nova Coleta
                            </button>
                            
                            {/* REGRA: Só exibe o botão se o usuário for Farmacêutica */}
                            {usuarioLogado?.role?.toLowerCase() === 'farmaceutica' && (
                                <button
                                    onClick={() => setTelaAtual('analise')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        telaAtual === 'analise'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    📥 Fila de Análise
                                </button>
                            )}
                        </div>

                        {/* Divisor Visual */}
                        <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

                        {/* Botão de Logout */}
                        <button
                            onClick={onLogout}
                            className="bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-slate-700 hover:border-rose-900/50 flex items-center gap-1.5"
                        >
                            <span>🚪</span>
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}