// src/components/shared/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const dataHoje = new Date().toLocaleDateString('pt-BR');

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [pendentes,  setPendentes]  = useState(0);
  const [recoletas,  setRecoletas]  = useState(0);

  useEffect(() => {
    async function buscarContadores() {
      try {
        const response = await api.get('/laudos/consultar');
        const laudos = response.data;
        setPendentes(laudos.filter(l => l.status === 'Pendente Análise').length);
        setRecoletas(laudos.filter(l => l.status === 'Recoleta').length);
      } catch {
        // falha silenciosa — não quebra a navbar
      }
    }
    buscarContadores();
  }, [location.pathname]); // recarrega ao mudar de página

  const NAV_LINKS = [
    { to: '/alertas',      label: '🚨 Painel de Alertas', pin: pendentes  },
    { to: '/coleta',       label: '📝 Registrar Coleta',  pin: 0          },
    { to: '/analise',      label: '⏳ Aguardando Laudo',  pin: pendentes  },
    { to: '/consulta',     label: '🔍 Consulta & Análise',pin: recoletas  },
    { to: '/tendencia',    label: '📉 Tendência',         pin: 0          },
    { to: '/colaboradores',label: '👥 Colaboradores',     pin: 0          },
  ];

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
        <div className="max-w-400 mx-auto flex flex-wrap gap-1 px-4">
          {NAV_LINKS.map(({ to, label, pin }) => (
            <MenuLink
              key={to}
              to={to}
              label={label}
              active={location.pathname === to}
              pin={pin}
            />
          ))}

          {/* Link de cadastro — só farmacêutica */}
          {user?.role === 'farmaceutica' && (
            <MenuLink
              to="/cadastro"
              label="👤 Cadastrar Usuário"
              active={location.pathname === '/cadastro'}
              pin={0}
            />
          )}
        </div>
      </div>

    </nav>
  );
}

function MenuLink({ to, label, active, pin }) {
  return (
    <Link
      to={to}
      className={`relative px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all border-b-2 -mb-0.5 ${
        active
          ? 'bg-[#161b22] text-emerald-400 border-emerald-500 font-black'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
      }`}
    >
      {label}

      {/* Pin de notificação */}
      {pin > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black rounded-full min-w-4 h-4 flex items-center justify-center px-1 leading-none">
          {pin > 99 ? '99+' : pin}
        </span>
      )}
    </Link>
  );
}
