// src/pages/ConsultaAnalise.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TIPOS_COLETA,
  obterBadgeTipo,
  obterGrau,
  obterNomePonto,
} from '../utils/laudoHelpers';
import UploadLaudo from '../components/shared/UploadLaudo';

// ── HELPERS ────────────────────────────────────────────────────────────────────

// Formata data com segurança — evita Invalid Date
function formatarData(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

// Limite de referência por grau
function obterLimiteReferencia(pontoId) {
  if (!pontoId) return null;
  if (pontoId.includes('fluxo'))   return { texto: '0 UFC/PL',   cor: 'text-teal-400'   };
  if (pontoId.includes('geral'))   return { texto: '< 25 UFC/PL', cor: 'text-amber-400'  };
  if (pontoId.includes('pulo'))    return { texto: '< 25 UFC/PL', cor: 'text-orange-400' };
  if (pontoId.includes('lavacao')) return { texto: '< 50 UFC/PL', cor: 'text-purple-400' };
  if (pontoId.includes('antibio')) return { texto: '< 25 UFC/PL', cor: 'text-amber-400'  };
  if (pontoId.includes('hormonio'))return { texto: '< 25 UFC/PL', cor: 'text-amber-400'  };
  return null;
}

// Nome da sala a partir do pontoId
function obterNomeSala(pontoId) {
  if (!pontoId) return null;
  if (pontoId.includes('lavacao'))  return 'Lavação';
  if (pontoId.includes('antibio'))  return 'Sala 2 — Antibióticos';
  if (pontoId.includes('hormonio')) return 'Sala 3 — Hormônios';
  if (pontoId.includes('geral') || pontoId.includes('fluxo')) return 'Sala 1 — Geral';
  return null;
}

// Ícone e cor do título por sala
function obterEstiloSala(sala) {
  if (!sala) return { icone: '📍', cor: 'text-slate-400', borda: 'border-slate-700' };
  if (sala.includes('Antibióticos')) return { icone: '🔴', cor: 'text-rose-400',    borda: 'border-rose-800/40'    };
  if (sala.includes('Hormônios'))    return { icone: '🟣', cor: 'text-violet-400',   borda: 'border-violet-800/40'  };
  if (sala.includes('Geral'))        return { icone: '🔴', cor: 'text-emerald-400',  borda: 'border-emerald-800/40' };
  if (sala.includes('Lavação'))      return { icone: '🟣', cor: 'text-purple-400',   borda: 'border-purple-800/40'  };
  return { icone: '📍', cor: 'text-slate-400', borda: 'border-slate-700' };
}

// ── PÁGINA ────────────────────────────────────────────────────────────────────

export default function ConsultaAnalise() {
  const [laudos,     setLaudos]     = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');
  const [cardAberto, setCardAberto] = useState(null);
  const [excluindo,  setExcluindo]  = useState('');

  const [filtroTipo,        setFiltroTipo]        = useState('Todos');
  const [filtroStatus,      setFiltroStatus]      = useState('Todos');
  const [filtroMesAno,      setFiltroMesAno]      = useState('');
  const [filtroNumeroLaudo, setFiltroNumeroLaudo] = useState('');

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

  const handleAtualizarLaudo = (laudoAtualizado) =>
    setLaudos(prev => prev.map(l => l._id === laudoAtualizado._id ? laudoAtualizado : l));

  const toggleCard = (id) =>
    setCardAberto(prev => prev === id ? null : id);

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este laudo permanentemente? Esta ação não pode ser desfeita.')) return;
    setExcluindo(id);
    try {
      await api.delete(`/laudos/${id}`);
      setLaudos(prev => prev.filter(l => l._id !== id));
      if (cardAberto === id) setCardAberto(null);
    } catch {
      setErro('Erro ao excluir laudo. Tente novamente.');
    } finally {
      setExcluindo('');
    }
  };

  const laudosFiltrados = laudos.filter(laudo => {
    if (filtroTipo !== 'Todos' && laudo.tipoColeta !== filtroTipo) return false;
    if (filtroStatus === 'Recebidos'      && laudo.status === 'Pendente Análise') return false;
    if (filtroStatus === 'Pendentes'      && laudo.status !== 'Pendente Análise') return false;
    if (filtroStatus === 'Recoleta'       && laudo.status !== 'Recoleta')         return false;
    if (filtroStatus === 'Intercorrência' && (!laudo.intercorrencia || laudo.intercorrencia === 'Nenhuma')) return false;

    if (filtroMesAno) {
      const [ano, mes] = filtroMesAno.split('-');
      const d = new Date(laudo.dataColeta);
      if (isNaN(d.getTime())) return false;
      if (d.getFullYear().toString() !== ano) return false;
      if ((d.getMonth() + 1).toString().padStart(2, '0') !== mes) return false;
    }

    if (filtroNumeroLaudo.trim()) {
      if (!laudo.numeroLaudo?.toLowerCase().includes(filtroNumeroLaudo.toLowerCase())) return false;
    }

    return true;
  });

  const totalFiltrados = laudosFiltrados.length;
  const totalRecebidos = laudosFiltrados.filter(l => l.status !== 'Pendente Análise').length;
  const totalPendentes = laudosFiltrados.filter(l => l.status === 'Pendente Análise').length;

  const selectClass = 'w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500';

  function BadgeStatus({ status }) {
    if (status === 'Recoleta')         return <span className="text-amber-400 font-black uppercase tracking-wider text-[10px]">🔄 Recoleta</span>;
    if (status === 'Pendente Análise') return <span className="text-amber-500 font-black uppercase tracking-wider text-[10px]">⏳ Pendente</span>;
    if (status === 'Inconforme')       return <span className="text-rose-400 font-black uppercase tracking-wider text-[10px]">❌ Inconforme</span>;
    return <span className="text-emerald-400 font-black uppercase tracking-wider text-[10px]">✅ Recebido</span>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
          🔍 Consulta & Análise
        </h1>
        <p className="text-xs text-slate-400 mt-1">Histórico completo de coletas e resultados</p>
      </div>

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
              <option value="Recoleta">Recoleta</option>
              <option value="Intercorrência">Com Intercorrência</option>
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

      {/* Indicadores — 3 cards igual ao exemplo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '📋', valor: totalFiltrados, label: 'Registros',        cor: 'text-blue-400'    },
          { icon: '✅', valor: totalRecebidos, label: 'Laudos Recebidos', cor: 'text-emerald-400' },
          { icon: '⏳', valor: totalPendentes, label: 'Pendentes',        cor: 'text-amber-500'   },
        ].map(({ icon, valor, label, cor }) => (
          <div key={label} className="bg-[#161b22] border border-slate-800 p-6 rounded-lg text-center space-y-2">
            <span className="text-2xl">{icon}</span>
            <p className={`text-4xl font-black ${cor}`}>{carregando ? '--' : valor}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
          </div>
        ))}
      </div>

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

      {/* Listagem */}
      {!carregando && laudosFiltrados.map((laudo) => {
        const badge    = obterBadgeTipo(laudo.tipoColeta);
        const grau     = obterGrau(laudo.pontoId);
        const prazo    = formatarData(laudo.dataPrazo);
        const aberto   = cardAberto === laudo._id;
        const sala     = obterNomeSala(laudo.pontoId);
        const estiloSala = obterEstiloSala(sala);
        const limite   = obterLimiteReferencia(laudo.pontoId);

        return (
          <div
            key={laudo._id}
            className="bg-[#161b22]/40 border border-slate-800 rounded-lg overflow-hidden transition-colors hover:border-slate-700"
          >
            {/* Título da sala — aparece só se tiver sala */}
            {sala && (
              <div className={`px-4 py-2 border-b ${estiloSala.borda} bg-[#161b22]/60 flex items-center gap-2`}>
                <span>{estiloSala.icone}</span>
                <span className={`text-xs font-black uppercase tracking-wider ${estiloSala.cor}`}>
                  {sala}
                </span>
              </div>
            )}

            {/* Linha principal — clicável */}
            <div
              className="p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer"
              onClick={() => toggleCard(laudo._id)}
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
                    {formatarData(laudo.dataColeta)} · {laudo.turno || '—'}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 tracking-wide">
                  {obterNomePonto(laudo)}
                </h3>
                {laudo.intercorrencia && laudo.intercorrencia !== 'Nenhuma' && (
                  <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wide">
                    ⚠️ {laudo.intercorrencia}
                  </span>
                )}
              </div>

              {/* Direita */}
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto text-[10px] border-t md:border-none border-slate-800/40 pt-2 md:pt-0">
                <BadgeStatus status={laudo.status} />
                <div className="text-right text-slate-500">
                  Prazo: <span className="text-slate-400 font-medium">{prazo}</span>
                </div>
                <span className="text-slate-600 text-xs">{aberto ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Painel expandido */}
            {aberto && (
              <div className="border-t border-slate-800/40 bg-[#0d1117]/30">

                {/* Grid de dados técnicos */}
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-[10px]">
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">UFC/PL (Bact.)</p>
                    <p className="text-slate-300 font-bold">
                      {laudo.ufcBacterias !== null && laudo.ufcBacterias !== undefined ? laudo.ufcBacterias : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Lote (Bact.)</p>
                    <p className="text-slate-300 font-bold">{laudo.loteBact || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">UFC/PL (Fung.)</p>
                    <p className="text-slate-300 font-bold">
                      {laudo.ufcFungos !== null && laudo.ufcFungos !== undefined ? laudo.ufcFungos : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Lote (Fung.)</p>
                    <p className="text-slate-300 font-bold">{laudo.loteFung || laudo.loteOperacional || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Limite de Referência</p>
                    <p className={`font-bold ${limite ? limite.cor : 'text-slate-400'}`}>
                      {limite ? limite.texto : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Prazo Laudo</p>
                    <p className="text-slate-300 font-bold">{prazo}</p>
                  </div>
                </div>

                {/* Segunda linha de dados */}
                <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Data Leitura</p>
                    <p className="text-slate-300 font-bold">{formatarData(laudo.dataAnalise)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Resp. Leitura</p>
                    <p className="text-slate-300 font-bold">{laudo.responsavelLeitura || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Resp. Coleta</p>
                    <p className="text-slate-300 font-bold">{laudo.responsavelColeta || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 uppercase font-bold">Obs.</p>
                    <p className="text-slate-300 font-bold">{laudo.observacoesCampo || '—'}</p>
                  </div>
                </div>

                {/* Upload + Excluir */}
                <div className="px-4 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-t border-slate-800/40 pt-4">
                  <UploadLaudo
                    laudoId={laudo._id}
                    arquivos={laudo.arquivos || []}
                    onAtualizar={handleAtualizarLaudo}
                  />
                  <button
                    onClick={() => handleExcluir(laudo._id)}
                    disabled={excluindo === laudo._id}
                    className="shrink-0 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 text-[10px] font-black px-4 py-2 rounded uppercase tracking-wider transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    {excluindo === laudo._id ? 'Excluindo...' : '🗑 Excluir'}
                  </button>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}