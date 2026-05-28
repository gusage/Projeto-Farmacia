// src/components/shared/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/alertas',       label: '🚨 Painel de Alertas'  },
  { to: '/coleta',        label: '📝 Registrar Coleta'   },
  { to: '/analise',       label: '⏳ Aguardando Laudo'   },
  { to: '/consulta',      label: '🔍 Consulta & Análise' },
  { to: '/relatorios',    label: '📊 Relatórios'        },
  { to: '/colaboradores', label: '👥 Colaboradores'      },
];

const dataHoje = new Date().toLocaleDateString('pt-BR'); // fora do componente — calcula só uma vez

export default function Navbar() {
  const { user, logout } = useAuth(); // sem precisar de props
  const location = useLocation();

  return (
    <nav className="bg-[#161b22] border-b border-slate-800 font-mono select-none">

      {/* TOPO: Identificação Corporativa */}
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
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

        {/* Sessão do Operador */}
        <div className="flex items-center gap-6 text-right">
          <div className="hidden sm:block">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">OPERADOR</span>
            <span className="text-xs font-bold text-slate-300">{user?.nome}</span>
          </div>
          <div className="hidden md:block border-l border-slate-800 pl-6">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">DATA OPERAÇÃO</span>
            <span className="text-xs font-bold text-emerald-500 tracking-wide">{dataHoje}</span>
          </div>
          <button
            onClick={logout}
            className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded transition-colors"
          >
            SAIR ✕
          </button>
        </div>
      </div>

      {/* BASE: Menu de Navegação */}
      <div className="border-t border-slate-800/60 bg-[#12161f]">
        <div className="max-w-400px mx-auto flex flex-wrap gap-1 px-4">
          {NAV_LINKS.map(({ to, label }) => (
            <MenuLink
              key={to}
              to={to}
              label={label}
              active={location.pathname === to}
            />
          ))}
        </div>
      </div>

    </nav>
  );
}

function MenuLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all border-b-2 relative -mb-0.5 ${
        active
          ? 'bg-[#161b22] text-emerald-400 border-emerald-500 font-black'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
      }`}
    >
      {label}
    </Link>
  );
}
