// frontend/src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ usuario, setUsuarioLogado }) {
  const location = useLocation();
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  // Função auxiliar para marcar qual aba está ativa na tela
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#161b22] border-b border-slate-800 font-mono select-none">
      {/* 1. TOPO DA NAVBAR: Identificação Corporativa */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-emerald-950/50 border border-emerald-800 flex items-center justify-center text-emerald-400 font-black">
            🔬
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-emerald-500 block uppercase">
              ATLAS PHARMA S.A. · MES SYSTEM
            </span>
            <span className="text-sm font-black tracking-wider text-slate-200 uppercase">
              BioCount
            </span>
          </div>
        </div>

        {/* Informações de Sessão do Operador */}
        <div className="flex items-center gap-6 text-right">
          <div className="hidden sm:block">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">OPERADOR</span>
            <span className="text-xs font-bold text-slate-300">{usuario?.nome}</span>
          </div>
          <div className="hidden md:block border-l border-slate-800 pl-6">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">DATA OPERAÇÃO</span>
            <span className="text-xs font-bold text-emerald-500 tracking-wide">{dataHoje}</span>
          </div>
          <button 
            onClick={() => setUsuarioLogado(null)}
            className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded transition-colors"
          >
            SAIR ✕
          </button>
        </div>
      </div>

      {/* 2. BASE DA NAVBAR: Abas de Navegação (Menu Industrial) */}
      <div className="border-t border-slate-800/60 bg-[#12161f]">
        <div className="max-w-[1600px] mx-auto flex flex-wrap gap-1 px-4">
          <MenuLink to="/alertas" label="🚨 Painel de Alertas" active={isActive('/alertas')} />
          <MenuLink to="/coleta" label="📝 Registrar Coleta" active={isActive('/coleta')} />
          <MenuLink to="/analise" label="⏳ Aguardando Laudo" active={isActive('/analise')} />
          <MenuLink to="/consulta" label="🔍 Consulta & Análise" active={isActive('/consulta')} />
          <MenuLink to="/colaboradores" label="👥 Colaboradores" active={isActive('/colaboradores')} />
        </div>
      </div>
    </nav>
  );
}

// Sub-componente interno para estilizar os links do menu
function MenuLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all border-b-2 relative -mb-[2px] ${
        active 
          ? 'bg-[#161b22] text-emerald-400 border-emerald-500 font-black' 
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
      }`}
    >
      {label}
    </Link>
  );
}
