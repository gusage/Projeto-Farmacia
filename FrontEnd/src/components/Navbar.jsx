// frontend/src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  // Função helper que aplica a cor verde-esmeralda apenas no botão da aba ativa
  const linkClasse = (path) => `
    px-3 py-2 rounded text-[10px] font-bold uppercase transition-all tracking-wider border
    ${location.pathname === path 
      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50' 
      : 'text-slate-400 hover:text-slate-200 bg-transparent border-transparent hover:bg-slate-800/40'}
  `;

  return (
    <nav className="bg-[#161b22] border-b border-slate-800 px-6 py-3 flex items-center justify-between font-mono sticky top-0 z-50">
      
      {/* Logo à Esquerda */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🔬</span>
        <span className="text-xs font-black tracking-widest text-slate-200 uppercase">
          BioCount <span className="text-emerald-500">MES</span>
        </span>
      </div>

      {/* Links de Navegação (Alertas como primeiro da lista) */}
      <div className="flex items-center gap-2">
        <Link to="/alertas" className={linkClasse('/alertas')}>
          🚨 Painel Alertas
        </Link>

        <Link to="/coleta" className={linkClasse('/coleta')}>
          📋 Coleta
        </Link>

        <Link to="/analise" className={linkClasse('/analise')}>
          🧪 Análise
        </Link>

        <Link to="/consulta" className={linkClasse('/consulta')}>
          🔍 Consulta
        </Link>
      </div>

    </nav>
  );
}