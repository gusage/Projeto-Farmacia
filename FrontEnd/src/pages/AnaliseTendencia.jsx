// src/pages/AnaliseTendencia.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

// Idealmente importado de src/utils/laudoHelpers.js
const TIPOS_COLETA = [
  'Sedimentação - Bactérias',
  'Sedimentação - Fungos',
  'Contato - Bactérias',
  'Contato - Fungos',
  'Toque de Luvas',
  'Mãos sem Luva',
  'Uniforme Estéril',
];

const dataAtualizacao = new Date().toLocaleDateString('pt-BR'); // calculado uma vez

export default function AnaliseTendencia() {
  const [laudos,     setLaudos]     = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos os tipos');

  useEffect(() => {
    async function buscarDados() {
      try {
        const response = await api.get('/laudos/consultar');
        if (Array.isArray(response.data)) setLaudos(response.data);
      } catch {
        setErro('Erro ao carregar dados de tendência.');
      } finally {
        setCarregando(false);
      }
    }
    buscarDados();
  }, []);

  // Filtro principal
  const laudosFiltrados = laudos.filter(l => {
    if (!l?.tipoColeta) return false;
    return filtroTipo === 'Todos os tipos' || l.tipoColeta === filtroTipo;
  });

  // Resumo geral — baseado no filtro aplicado
  const total      = laudosFiltrados.length;
  const aprovados  = laudosFiltrados.filter(l => l.status === 'Conforme').length;
  const reprovados = laudosFiltrados.filter(l => l.status === 'Inconforme').length;
  const pendentes  = laudosFiltrados.filter(l => l.status === 'Pendente Análise').length;

  // Bloco inferior — stats do tipo filtrado (ou sedimentação se "Todos")
  const tipoDetalhe = filtroTipo === 'Todos os tipos' ? 'Sedimentação - Bactérias' : filtroTipo;
  const laudosDetalhe  = laudos.filter(l => l?.tipoColeta === tipoDetalhe);
  const totalDetalhe   = laudosDetalhe.length;
  const aprovDetalhe   = laudosDetalhe.filter(l => l.status === 'Conforme').length;
  const reprovDetalhe  = laudosDetalhe.filter(l => l.status === 'Inconforme').length;
  const pendDetalhe    = laudosDetalhe.filter(l => l.status === 'Pendente Análise').length;

  const val = (n) => carregando ? '—' : n;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-base font-bold text-slate-200 tracking-wide flex items-center gap-2">
          📉 Análise de Tendência
        </h1>
        <p className="text-[10px] text-slate-500 tracking-wide mt-1">
          Visão detalhada dos resultados com filtros e resumo visual
        </p>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-3 rounded text-xs font-bold border bg-rose-950/40 border-rose-800 text-rose-400">
          ⚠️ {erro}
        </div>
      )}

      {/* Filtro */}
      <div className="border border-slate-800 bg-[#161b22]/50 p-4 rounded-lg">
        <label className="block text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">
          Filtro por Tipo
        </label>
        <select
          className="w-full sm:w-80 bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option value="Todos os tipos">Todos os tipos</option>
          {TIPOS_COLETA.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Resumo Geral */}
      <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
        <div className="flex justify-between items-center text-xs">
          <h2 className="font-bold text-slate-200">
            Resumo Geral —{' '}
            <span className="text-slate-400">
              {carregando ? 'Carregando...' : `${total} registros`}
            </span>
          </h2>
          <span className="text-[9px] text-slate-500">
            Atualizado em: {dataAtualizacao}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Aprovados',  valor: aprovados,  cor: 'text-emerald-500', bg: 'bg-emerald-950/30 border-emerald-900/40' },
            { label: 'Reprovados', valor: reprovados, cor: 'text-rose-500',    bg: 'bg-rose-950/20 border-rose-950'          },
            { label: 'Pendentes',  valor: pendentes,  cor: 'text-amber-500',   bg: 'bg-[#161b22] border-slate-800'           },
          ].map(({ label, valor, cor, bg }) => (
            <div key={label} className={`${bg} border p-4 rounded text-center space-y-1`}>
              <p className={`text-3xl font-black ${cor}`}>{val(valor)}</p>
              <p className={`text-[9px] font-black uppercase tracking-wider ${cor} opacity-70`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhe por tipo — muda conforme filtro */}
      <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
        <div className="flex items-center gap-3">
          <span className="bg-blue-950 text-blue-400 border border-blue-900/60 px-2 py-0.5 rounded text-[9px] font-black uppercase">
            {tipoDetalhe}
          </span>
          <h3 className="text-xs font-bold text-slate-200">
            {val(totalDetalhe)} registros
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Aprovados',  valor: aprovDetalhe,  cor: 'text-emerald-500', bg: 'bg-emerald-950/20 border-emerald-900/40' },
            { label: 'Reprovados', valor: reprovDetalhe, cor: 'text-rose-500',    bg: 'bg-rose-950/10 border-rose-950'          },
            { label: 'Pendentes',  valor: pendDetalhe,   cor: 'text-amber-500',   bg: 'bg-[#161b22] border-slate-800'           },
          ].map(({ label, valor, cor, bg }) => (
            <div key={label} className={`${bg} border p-3 rounded flex justify-between items-center`}>
              <span className={`text-[10px] font-bold uppercase ${cor} opacity-70`}>{label}</span>
              <span className={`text-base font-black ${cor}`}>{val(valor)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
