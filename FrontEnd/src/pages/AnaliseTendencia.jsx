// src/pages/AnaliseTendencia.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { TIPOS_COLETA, NOME_PONTO, GRAU_PONTO } from '../utils/laudoHelpers';

const dataAtualizacao = new Date().toLocaleDateString('pt-BR');

// ── HELPERS ────────────────────────────────────────────────────────────────────

const GRUPOS_SALA = {
  'Sala 2 — Antibióticos': 'antibio',
  'Sala 3 — Hormônios':    'hormonio',
  'Sala 1 — Geral':        'geral',
  'Lavação':               'lavacao',
};

function obterGrauPonto(pontoId) {
  if (!pontoId) return null;
  const chave = Object.keys(GRAU_PONTO).find(k => pontoId.includes(k));
  return chave ? GRAU_PONTO[chave].texto : null;
}

function pct(num, den) {
  if (!den) return 0;
  return Math.round((num / den) * 100);
}

// Agrupa laudos por mês e calcula % aprovação
function gerarDadosGrafico(laudos) {
  const porMes = {};
  laudos.forEach(l => {
    if (l.status === 'Pendente Análise') return;
    const d = new Date(l.dataColeta);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!porMes[chave]) porMes[chave] = { total: 0, aprovados: 0 };
    porMes[chave].total++;
    if (l.status === 'Conforme') porMes[chave].aprovados++;
  });

  return Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, { total, aprovados }]) => ({
      mes: mes.split('-').reverse().join('/').slice(3), // MM/YYYY → só MM/YY
      aprovacao: pct(aprovados, total),
    }));
}

// Ranking dos piores pontos
function gerarRankingPiores(laudos) {
  const porPonto = {};
  laudos.forEach(l => {
    if (!l.pontoId || l.status === 'Pendente Análise') return;
    if (!porPonto[l.pontoId]) porPonto[l.pontoId] = { total: 0, reprovados: 0 };
    porPonto[l.pontoId].total++;
    if (l.status === 'Inconforme') porPonto[l.pontoId].reprovados++;
  });

  return Object.entries(porPonto)
    .map(([pontoId, { total, reprovados }]) => ({
      pontoId,
      nome:      NOME_PONTO[pontoId] || pontoId,
      grau:      obterGrauPonto(pontoId),
      total,
      reprovados,
      pctReprov: pct(reprovados, total),
    }))
    .sort((a, b) => b.pctReprov - a.pctReprov)
    .slice(0, 5);
}

// Análise por sala
function gerarAnaliseSalas(laudos) {
  return Object.entries(GRUPOS_SALA).map(([nomeSala, chave]) => {
    const laudosSala = laudos.filter(l =>
      l.pontoId?.includes(chave) && l.status !== 'Pendente Análise'
    );
    const total     = laudosSala.length;
    const aprovados = laudosSala.filter(l => l.status === 'Conforme').length;
    return { nomeSala, total, aprovados, pct: pct(aprovados, total) };
  });
}

// Alertas automáticos
function gerarAlertas(laudosFiltrados) {
  const alertas = [];
  const analiseSalas = gerarAnaliseSalas(laudosFiltrados);

  analiseSalas.forEach(({ nomeSala, pct: p, total }) => {
    if (total > 0 && p < 50) {
      alertas.push(`Tendência negativa na ${nomeSala}: ${p}% de aprovação`);
    }
  });

  const laudosRecentes = laudosFiltrados
    .filter(l => l.status !== 'Pendente Análise')
    .slice(0, 10);

  if (laudosRecentes.length > 0) {
    const aprovRecentes = laudosRecentes.filter(l => l.status === 'Conforme').length;
    const pctRecente    = pct(aprovRecentes, laudosRecentes.length);
    if (pctRecente < 60) {
      alertas.push(`Alerta: Taxa de aprovação recente baixa (${pctRecente}%)`);
    }
  }

  return alertas;
}

// ── COMPONENTE ─────────────────────────────────────────────────────────────────

export default function AnaliseTendencia() {
  const [laudos,        setLaudos]        = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [carregando,    setCarregando]    = useState(true);
  const [erro,          setErro]          = useState('');

  // Filtros
  const [filtroTipo,        setFiltroTipo]        = useState('Todos os tipos');
  const [filtroColaborador, setFiltroColaborador] = useState('Todos');
  const [filtroSala,        setFiltroSala]        = useState('Todas');
  const [filtroPeriodo,     setFiltroPeriodo]     = useState('historico');

  useEffect(() => {
    async function buscarDados() {
      try {
        const [resLaudos, resColab] = await Promise.all([
          api.get('/laudos/consultar'),
          api.get('/colaboradores'),
        ]);
        if (Array.isArray(resLaudos.data))  setLaudos(resLaudos.data);
        if (Array.isArray(resColab.data))   setColaboradores(resColab.data);
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
    if (filtroTipo !== 'Todos os tipos' && l.tipoColeta !== filtroTipo) return false;
    if (filtroColaborador !== 'Todos' && l.colaboradorId !== filtroColaborador) return false;
    if (filtroSala !== 'Todas' && l.pontoId && !l.pontoId.includes(GRUPOS_SALA[filtroSala] || '')) return false;

    if (filtroPeriodo !== 'historico') {
      const agora  = new Date();
      const coleta = new Date(l.dataColeta);
      const diff   = (agora - coleta) / (1000 * 60 * 60 * 24);
      if (filtroPeriodo === '30'  && diff > 30)  return false;
      if (filtroPeriodo === '90'  && diff > 90)  return false;
      if (filtroPeriodo === '180' && diff > 180) return false;
    }

    return true;
  });

  // Métricas gerais
  const total          = laudosFiltrados.length;
  const aprovados      = laudosFiltrados.filter(l => l.status === 'Conforme').length;
  const reprovados     = laudosFiltrados.filter(l => l.status === 'Inconforme').length;
  const intercorrencia = laudosFiltrados.filter(l => l.intercorrencia && l.intercorrencia !== 'Nenhuma').length;
  const pctAprovacao   = pct(aprovados, laudosFiltrados.filter(l => l.status !== 'Pendente Análise').length);

  // Dados derivados
  const dadosGrafico  = gerarDadosGrafico(laudosFiltrados);
  const rankingPiores = gerarRankingPiores(laudosFiltrados);
  const analisesSalas = gerarAnaliseSalas(laudosFiltrados);
  const alertas       = gerarAlertas(laudosFiltrados);

  // Detalhe por tipo
  const tipoDetalhe   = filtroTipo === 'Todos os tipos' ? 'Sedimentação - Bactérias' : filtroTipo;
  const laudosDetalhe = laudosFiltrados.filter(l => l?.tipoColeta === tipoDetalhe);
  const aprovDet      = laudosDetalhe.filter(l => l.status === 'Conforme').length;
  const reprovDet     = laudosDetalhe.filter(l => l.status === 'Inconforme').length;
  const interDet      = laudosDetalhe.filter(l => l.intercorrencia && l.intercorrencia !== 'Nenhuma').length;

  const val        = (n) => carregando ? '—' : n;
  const selectClass = 'w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-base font-bold text-slate-200 tracking-wide flex items-center gap-2">
          📉 Análise de Tendência Avançada
        </h1>
        <p className="text-[10px] text-slate-500 tracking-wide mt-1">
          Monitoramento completo com filtros, gráficos e alertas de tendências
        </p>
      </div>

      {erro && (
        <div className="p-3 rounded text-xs font-bold border bg-rose-950/40 border-rose-800 text-rose-400">
          ⚠️ {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="border border-slate-800 bg-[#161b22]/50 p-4 rounded-lg space-y-3">
        <h2 className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Filtros Avançados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Tipo de Coleta</label>
            <select className={selectClass} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="Todos os tipos">Todos os tipos</option>
              {TIPOS_COLETA.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Colaborador</label>
            <select className={selectClass} value={filtroColaborador} onChange={e => setFiltroColaborador(e.target.value)}>
              <option value="Todos">Todos</option>
              {colaboradores.map(c => (
                <option key={c._id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Sala / Área</label>
            <select className={selectClass} value={filtroSala} onChange={e => setFiltroSala(e.target.value)}>
              <option value="Todas">Todas</option>
              {Object.keys(GRUPOS_SALA).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Período</label>
            <select className={selectClass} value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
              <option value="historico">Todo histórico</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="180">Últimos 6 meses</option>
            </select>
          </div>

        </div>
      </div>

      {/* Resumo Geral */}
      <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
        <div className="flex justify-between items-center text-xs">
          <h2 className="font-bold text-slate-200">
            Resumo Geral —{' '}
            <span className="text-slate-400">{carregando ? 'Carregando...' : `${total} registros`}</span>
            {!carregando && total > 0 && (
              <span className="text-emerald-400 ml-2">• {pctAprovacao}% Aprovação</span>
            )}
          </h2>
          <span className="text-[9px] text-slate-500">Atualizado: {dataAtualizacao}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Aprovados',      valor: aprovados,      cor: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60' },
            { label: 'Reprovados',     valor: reprovados,     cor: 'text-rose-400',    bg: 'bg-rose-950/40 border-rose-800/60'       },
            { label: 'Intercorrências',valor: intercorrencia, cor: 'text-amber-400',   bg: 'bg-amber-950/30 border-amber-800/40'     },
          ].map(({ label, valor, cor, bg }) => (
            <div key={label} className={`${bg} border p-6 rounded text-center space-y-2`}>
              <p className={`text-4xl font-black ${cor}`}>{val(valor)}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest ${cor} opacity-80`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas de Tendência */}
      {!carregando && alertas.length > 0 && (
        <div className="border border-amber-900/50 bg-amber-950/20 p-4 rounded-lg space-y-2">
          <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
            ⚠️ Alertas de Tendência:
          </h2>
          <ul className="space-y-1">
            {alertas.map((alerta, i) => (
              <li key={i} className="text-[11px] text-amber-400 flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{alerta}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gráfico de Evolução */}
      <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
        <h2 className="text-xs font-bold text-slate-200">Evolução Temporal da Aprovação (%)</h2>
        {dadosGrafico.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-xs uppercase">
            Dados insuficientes para gerar o gráfico.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dadosGrafico} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #334155', borderRadius: 6 }}
                labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                itemStyle={{ color: '#34d399', fontSize: 11 }}
                formatter={(v) => [`${v}%`, 'Aprovação']}
              />
              <Line
                type="monotone"
                dataKey="aprovacao"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: '#34d399', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Análise por Sala */}
      <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
        <h2 className="text-xs font-bold text-slate-200">Análise por Sala / Área</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {analisesSalas.map(({ nomeSala, total: t, aprovados: a, pct: p }) => (
            <div key={nomeSala} className="space-y-2">
              <p className="text-[9px] text-slate-500 uppercase font-bold">{nomeSala}</p>
              <p className={`text-2xl font-black ${p >= 80 ? 'text-emerald-400' : p >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {t === 0 ? '—' : `${p}%`}
              </p>
              {/* Barra de progresso */}
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${p}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-600">{a}/{t} aprovados</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking dos Piores Pontos */}
      {!carregando && rankingPiores.length > 0 && (
        <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            🔴 Ranking dos Piores Pontos <span className="text-slate-500 font-normal">(mais reprovações)</span>
          </h2>
          <div className="space-y-3">
            {rankingPiores.map(({ pontoId, nome, grau, reprovados: r, pctReprov }, i) => (
              <div key={pontoId} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-slate-600 font-bold shrink-0">{i + 1}.</span>
                  <span className="text-slate-300 truncate">{nome}</span>
                  {grau && (
                    <span className="shrink-0 bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                      {grau}
                    </span>
                  )}
                </div>
                <span className={`shrink-0 font-black text-[11px] ${pctReprov > 50 ? 'text-rose-400' : pctReprov > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {pctReprov}% reprovados ({r} coleta{r !== 1 ? 's' : ''})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalhe por tipo */}
      <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
        <div className="flex items-center gap-3">
          <span className="bg-blue-950 text-blue-400 border border-blue-900/60 px-2 py-0.5 rounded text-[9px] font-black uppercase">
            {tipoDetalhe}
          </span>
          <h3 className="text-xs font-bold text-slate-200">{val(laudosDetalhe.length)} registros</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Aprovados',      valor: aprovDet,  cor: 'text-emerald-500', bg: 'bg-emerald-950/20 border-emerald-900/40' },
            { label: 'Reprovados',     valor: reprovDet, cor: 'text-rose-500',    bg: 'bg-rose-950/10 border-rose-950'          },
            { label: 'Intercorrência', valor: interDet,  cor: 'text-orange-400',  bg: 'bg-orange-950/20 border-orange-900/40'   },
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
