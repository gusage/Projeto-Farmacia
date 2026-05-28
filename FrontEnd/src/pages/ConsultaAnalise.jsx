// src/pages/ConsultaAnalise.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TIPOS_COLETA,
  obterBadgeTipo,
  obterGrau,
  obterNomePonto
} from '../utils/laudoHelpers';

// ── PÁGINA ───────────────────────────────────────────────────────────────────────

export default function ConsultaAnalise() {
  const [laudos,     setLaudos]     = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');

  const [filtroTipo,         setFiltroTipo]         = useState('Todos');
  const [filtroStatus,       setFiltroStatus]       = useState('Todos');
  const [filtroMesAno,       setFiltroMesAno]       = useState('');
  const [filtroNumeroLaudo,  setFiltroNumeroLaudo]  = useState('');

  useEffect(() => {
    async function buscarHistorico() {
      try {
        const response = await api.get('/laudos/consultar');
        setLaudos(response.data);
      } catch {
        setErro('Erro ao carregar histórico. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    }
    buscarHistorico();
  }, []);

  // Filtros em cascata
  const laudosFiltrados = laudos.filter(laudo => {
    if (filtroTipo !== 'Todos' && laudo.tipoColeta !== filtroTipo) return false;

    if (filtroStatus === 'Recebidos' && laudo.status === 'Pendente Análise') return false;
    if (filtroStatus === 'Pendentes' && laudo.status !== 'Pendente Análise') return false;

    if (filtroMesAno) {
      const [ano, mes] = filtroMesAno.split('-');
      const d = new Date(laudo.dataColeta);
      if (d.getFullYear().toString() !== ano) return false;
      if ((d.getMonth() + 1).toString().padStart(2, '0') !== mes) return false;
    }

    if (filtroNumeroLaudo.trim()) {
      if (!laudo.numeroLaudo?.toLowerCase().includes(filtroNumeroLaudo.toLowerCase())) return false;
    }

    return true;
  });

  // Contadores refletem os filtros aplicados
  const totalFiltrados  = laudosFiltrados.length;
  const totalRecebidos  = laudosFiltrados.filter(l => l.status !== 'Pendente Análise').length;
  const totalPendentes  = laudosFiltrados.filter(l => l.status === 'Pendente Análise').length;

  const selectClass = 'w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
          🔍 Consulta & Análise
        </h1>
        <p className="text-xs text-slate-400 mt-1">Histórico completo de coletas e resultados</p>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-3 rounded text-xs font-bold border bg-rose-950/40 border-rose-800 text-rose-400">
          ⚠️ {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="border border-slate-800 bg-[#161b22] p-4 rounded-lg space-y-3">
        <h2 className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Tipo de Coleta</label>
            <select className={selectClass} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="Todos">Todos</option>
              {TIPOS_COLETA.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Status do Laudo</label>
            <select className={selectClass} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Recebidos">Laudos Recebidos</option>
              <option value="Pendentes">Pendentes</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Mês / Ano</label>
            <input type="month" className={selectClass} value={filtroMesAno} onChange={e => setFiltroMesAno(e.target.value)} />
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Nº do Laudo</label>
            <input
              type="text"
              placeholder="Buscar por nº do laudo"
              className={selectClass}
              value={filtroNumeroLaudo}
              onChange={e => setFiltroNumeroLaudo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Indicadores — refletem o filtro atual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '📋', valor: totalFiltrados, label: 'Registros',        cor: 'text-blue-400'    },
          { icon: '✅', valor: totalRecebidos, label: 'Laudos Recebidos', cor: 'text-emerald-400' },
          { icon: '⏳', valor: totalPendentes, label: 'Pendentes',        cor: 'text-amber-500'   },
        ].map(({ icon, valor, label, cor }) => (
          <div key={label} className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center space-y-1">
            <span className="text-xl">{icon}</span>
            <p className={`text-2xl font-black ${cor}`}>{carregando ? '--' : valor}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Listagem */}
      {carregando && (
        <div className="text-xs text-slate-500 animate-pulse text-center py-10">
          Sincronizando registros ativos...
        </div>
      )}

      {!carregando && laudosFiltrados.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs uppercase">
          Nenhum registro encontrado para os filtros selecionados.
        </div>
      )}

      {!carregando && laudosFiltrados.map((laudo) => {
        const badge      = obterBadgeTipo(laudo.tipoColeta);
        const grau       = obterGrau(laudo.pontoId);
        const estaPendente = laudo.status === 'Pendente Análise';
        const prazo      = laudo.dataPrazo
          ? new Date(laudo.dataPrazo).toLocaleDateString('pt-BR')
          : '—';

        return (
          <div
            key={laudo._id}
            className={`bg-[#161b22]/40 border ${
              estaPendente
                ? 'border-amber-900/40 hover:border-amber-800/60'
                : 'border-emerald-950 hover:border-emerald-800'
            } p-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-colors`}
          >
            {/* Esquerda */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`${badge.estilo} border px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight`}>
                  {badge.texto}
                </span>
                {grau && (
                  <span className={`${grau.classe} border px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight`}>
                    {grau.texto}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">
                  {new Date(laudo.dataColeta).toLocaleDateString('pt-BR')} · {laudo.turno}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-200 tracking-wide">
                {obterNomePonto(laudo)}
              </h3>
            </div>

            {/* Direita */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto text-[10px] border-t md:border-none border-slate-800/40 pt-2 md:pt-0">
              {estaPendente
                ? <span className="text-amber-500 font-black uppercase tracking-wider">⏳ Pendente</span>
                : <span className="text-emerald-400 font-black uppercase tracking-wider">✅ Recebido</span>
              }
              <div className="text-right text-slate-500">
                Prazo: <span className="text-slate-400 font-medium">{prazo}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
