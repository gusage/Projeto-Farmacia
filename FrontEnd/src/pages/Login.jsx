// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [erro, setErro]           = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const resultado = await login(email, password);
    console.log('resultado do login:', resultado);

    if (resultado.success) {
      navigate('/alertas'); // redireciona pelo router — sem precisar de prop
    } else {
      setErro(resultado.message);
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full border border-slate-800 bg-[#161b22]/40 p-8 rounded-lg space-y-6 shadow-2xl backdrop-blur-sm">

        {/* CABEÇALHO */}
        <div className="text-center space-y-1 border-b border-slate-800 pb-4">
          <p className="text-[9px] font-black tracking-widest text-emerald-500 uppercase">
            ATLAS PHARMA S.A. - MES SYSTEM
          </p>
          <h1 className="text-xl font-black tracking-wider text-slate-200 uppercase">
            Sistema de Monitoramento Ambiental
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Operação Estéril · Controle Interno · Autenticação
          </p>
        </div>

        <div className="pt-2">
          <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <span>🔒</span> GERENCIAMENTO DE ACESSO
          </h2>
        </div>

        {/* FORMULÁRIO */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {erro && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 text-rose-400 rounded text-[11px] font-bold uppercase tracking-wide">
              ⚠️ ERRO: {erro}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                E-mail Institucional
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-colors font-mono"
                placeholder="usuario@atlaspharma.com"
                disabled={carregando}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Senha de Acesso
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-colors font-mono"
                placeholder="••••••••••••"
                disabled={carregando}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded tracking-widest uppercase transition-all shadow-md shadow-emerald-950/50 disabled:opacity-40"
            >
              {carregando ? 'PROCESSANDO CREDENCIAIS...' : 'INICIAR SESSÃO'}
            </button>
          </div>
        </form>

        {/* RODAPÉ */}
        <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-[9px] text-slate-600 uppercase tracking-widest">
          <span>BioCount MES v2.4.0</span>
          <span>Logs de Auditoria Ativos</span>
        </div>

      </div>
    </div>
  );
}
