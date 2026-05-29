// src/pages/AnaliseLaudos.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { calcularDiasRestantes, TIPOS_COLETA, GRAU_PONTO, NOME_PONTO } from '../utils/laudoHelpers';
import UploadLaudo from '../components/shared/UploadLaudo';

function BadgePrazo({ dias }) {
  if (dias === null) return null;
  if (dias < 0)
    return <span className="text-rose-400 font-bold text-[9px] uppercase">⏳ Vencido há {Math.abs(dias)}d</span>;
  if (dias === 0)
    return <span className="text-amber-400 font-bold text-[9px] uppercase">⏳ Vence hoje</span>;
  return <span className="text-amber-500 font-bold text-[9px] uppercase">⏳ {dias}d restantes</span>;
}

function inputClass(focusColor = 'blue') {
  return `w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-[11px] outline-none focus:border-${focusColor}-500 transition-colors text-slate-200`;
}

const INTERCORRENCIAS = [
  'Nenhuma',
  'Recoleta Necessária',
  'Amostra Contaminada',
  'Problema no Transporte',
  'Erro de Identificação',
  'Amostra Insuficiente',
];

const SALAS = [
  { value: 'Todas', label: 'Todas' },
  { value: 'lavacao', label: 'Lavação' },
  { value: 'geral', label: 'Sala 1 — Geral' },
  { value: 'antibio', label: 'Sala 2 — Antibióticos' },
  { value: 'hormonio', label: 'Sala 3 — Hormônios' },
];

const GRAUS = ['Todos', 'Grau A', 'Grau B', 'Grau C', 'Grau D'];

// Obtém grau de um pontoId
function obterGrauPonto(pontoId) {
  if (!pontoId) return null;
  const chave = Object.keys(GRAU_PONTO).find(k => pontoId.includes(k));
  return chave ? GRAU_PONTO[chave].texto : null;
}

// Cor da borda do topo do card por prazo
function corTopoPrazo(dias) {
  if (dias === null) return 'border-slate-700';
  if (dias < 0)  return 'border-rose-600';
  if (dias === 0) return 'border-amber-500';
  if (dias <= 2)  return 'border-orange-500';
  return 'border-emerald-600';
}

export default function AnaliseLaudos() {
  const { user } = useAuth();
  const [laudos,     setLaudos]     = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem,   setMensagem]   = useState({ tipo: '', texto: '' });
  const [inputs,     setInputs]     = useState({});

  // Filtros
  const [filtroTipo,        setFiltroTipo]        = useState('Todos');
  const [filtroSala,        setFiltroSala]        = useState('Todas');
  const [filtroGrau,        setFiltroGrau]        = useState('Todos');
  const [filtroTurno,       setFiltroTurno]       = useState('Todos');
  const [filtroDataColeta,  setFiltroDataColeta]  = useState('');

  useEffect(() => {
    async function buscarPendentes() {
      try {
        const response = await api.get('/laudos/consultar?status=Pendente Análise');
        setLaudos(response.data);

        const init = {};
        response.data.forEach(l => {
          init[l._id] = {
            numeroLaudo:        '',
            resultadoFinal:     '',
            ufcBact:            '',
            ufcFung:            '',
            responsavelLeitura: user?.nome || '',
            intercorrencia:     'Nenhuma',
          };
        });
        setInputs(init);
      } catch {
        setMensagem({ tipo: 'erro', texto: 'Erro ao carregar laudos. Tente novamente.' });
      } finally {
        setCarregando(false);
      }
    }
    buscarPendentes();
  }, [user]);

  const handleInputChange = (id, campo, valor) =>
    setInputs(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));

  const handleAtualizarLaudo = (laudoAtualizado) =>
    setLaudos(prev => prev.map(l => l._id === laudoAtualizado._id ? laudoAtualizado : l));

  const confirmarRecebimento = async (id) => {
    const dados = inputs[id];

    if (!dados.resultadoFinal) {
      setMensagem({ tipo: 'erro', texto: '⚠️ Selecione o Resultado Final antes de confirmar.' });
      return;
    }

    setMensagem({ tipo: '', texto: '' });

    try {
      await api.put(`/laudos/atualizar/${id}`, {
        status:             dados.resultadoFinal === 'Aprovado'            ? 'Conforme'
                          : dados.intercorrencia === 'Recoleta Necessária' ? 'Recoleta'
                          : 'Inconforme',
        numeroLaudo:        dados.numeroLaudo,
        ufcBacterias:       Number(dados.ufcBact) || null,
        ufcFungos:          Number(dados.ufcFung) || null,
        responsavelLeitura: dados.responsavelLeitura,
        intercorrencia:     dados.intercorrencia,
        dataAnalise:        new Date(),
      });

      setMensagem({ tipo: 'sucesso', texto: '✅ Laudo confirmado e arquivado com sucesso!' });
      setLaudos(prev => prev.filter(l => l._id !== id));
    } catch {
      setMensagem({ tipo: 'erro', texto: '❌ Erro ao confirmar recebimento. Tente novamente.' });
    }
  };

  // Filtros aplicados
  const laudosFiltrados = laudos.filter(l => {
    if (filtroTipo  !== 'Todos' && l.tipoColeta !== filtroTipo)  return false;
    if (filtroTurno !== 'Todos' && l.turno      !== filtroTurno) return false;

    if (filtroSala !== 'Todas' && l.pontoId) {
      if (!l.pontoId.includes(filtroSala)) return false;
    }
    if (filtroSala !== 'Todas' && !l.pontoId) return false;

    if (filtroGrau !== 'Todos') {
      const grau = obterGrauPonto(l.pontoId);
      if (grau !== filtroGrau) return false;
    }

    if (filtroDataColeta) {
      const dataCard = new Date(l.dataColeta).toISOString().split('T')[0];
      if (dataCard !== filtroDataColeta) return false;
    }

    return true;
  });

  const selectClass = 'w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-200">
            📋 Aguardando Laudo
            <span className="bg-blue-900 text-blue-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {laudosFiltrados.length} pendentes
            </span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
            Registre o recebimento do resultado, número do laudo, UFC e status final.
          </p>
        </div>
      </div>

      {/* Flash */}
      {mensagem.texto && (
        <div className={`p-3 rounded text-xs font-bold border ${
          mensagem.tipo === 'sucesso'
            ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
            : 'bg-rose-950/40 border-rose-800 text-rose-400'
        }`}>
          {mensagem.texto}
        </div>
      )}

      {/* Filtros */}
      <div className="border border-slate-800 bg-[#161b22] p-4 rounded-lg space-y-3">
        <h2 className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Tipo de Coleta</label>
            <select className={selectClass} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="Todos">Todos</option>
              {TIPOS_COLETA.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Sala / Área</label>
            <select className={selectClass} value={filtroSala} onChange={e => setFiltroSala(e.target.value)}>
              {SALAS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Grau</label>
            <select className={selectClass} value={filtroGrau} onChange={e => setFiltroGrau(e.target.value)}>
              {GRAUS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Turno</label>
            <select className={selectClass} value={filtroTurno} onChange={e => setFiltroTurno(e.target.value)}>
              <option value="Todos">Todos</option>
              <option>Manhã</option>
              <option>Tarde</option>
              <option>Noite</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Data da Coleta</label>
            <input
              type="date"
              className={selectClass}
              value={filtroDataColeta}
              onChange={e => setFiltroDataColeta(e.target.value)}
            />
          </div>

        </div>
      </div>

      {carregando && (
        <div className="text-slate-500 text-xs animate-pulse">Sincronizando com Atlas...</div>
      )}

      {!carregando && laudosFiltrados.length === 0 && !mensagem.texto && (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
          Nenhum laudo aguardando leitura no momento. ✨
        </div>
      )}

      {/* Cards */}
      {!carregando && laudosFiltrados.map((laudo) => {
        const dias  = calcularDiasRestantes(laudo.dataPrazo);
        const input = inputs[laudo._id] || {};
        const grau  = obterGrauPonto(laudo.pontoId);
        const nomePonto = NOME_PONTO[laudo.pontoId] || laudo.pontoId || laudo.colaboradorId || '—';

        return (
          <div
            key={laudo._id}
            className={`bg-[#161b22] border-t-4 ${corTopoPrazo(dias)} border-x border-b border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors`}
          >
            {/* Topo do card — título + botão confirmar */}
            <div className="flex justify-between items-start p-4 pb-2">
              <div className="space-y-2">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-900/40 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    {laudo.tipoColeta}
                  </span>
                  {(laudo.pontoId || laudo.colaboradorId) && (
                    <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                      {laudo.pontoId || laudo.colaboradorId}
                    </span>
                  )}
                  <BadgePrazo dias={dias} />
                </div>

                {/* Título */}
                <h2 className="text-sm font-bold text-slate-200">
                  {laudo.tipoColeta} | {nomePonto}
                </h2>

                {/* Metadados */}
                <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 uppercase font-medium">
                  <span>Coleta: <b className="text-slate-400">{new Date(laudo.dataColeta).toLocaleDateString('pt-BR')}</b></span>
                  <span>Manhã: <b className="text-slate-400">{laudo.turno}</b></span>
                  <span>Prazo: <b className="text-slate-400">{laudo.dataPrazo ? new Date(laudo.dataPrazo).toLocaleDateString('pt-BR') : '—'}</b></span>
                  <span>Lote: <b className="text-slate-400">{laudo.loteBact || laudo.loteOperacional || '—'}</b></span>
                  {grau && <span>Grau: <b className="text-slate-400">{grau}</b></span>}
                </div>
              </div>

              {/* Botão confirmar — topo direito */}
              <button
                onClick={() => confirmarRecebimento(laudo._id)}
                className="shrink-0 ml-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-3 px-5 rounded shadow-lg uppercase tracking-wider transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>✅</span> Confirmar<br/>Recebimento
              </button>
            </div>

            {/* Inputs de análise */}
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Nº do Laudo</label>
                  <input
                    type="text"
                    placeholder="Ex: LAB-2026-045"
                    className={inputClass()}
                    value={input.numeroLaudo || ''}
                    onChange={e => handleInputChange(laudo._id, 'numeroLaudo', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Resultado Final</label>
                  <select
                    className={`${inputClass()} ${input.resultadoFinal === 'Aprovado' ? 'text-emerald-400' : input.resultadoFinal === 'Reprovado' ? 'text-rose-400' : 'text-slate-500'} font-bold`}
                    value={input.resultadoFinal || ''}
                    onChange={e => handleInputChange(laudo._id, 'resultadoFinal', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">UFC Bactérias</label>
                  <input
                    type="number"
                    placeholder="—"
                    className={`${inputClass()} text-center`}
                    value={input.ufcBact || ''}
                    onChange={e => handleInputChange(laudo._id, 'ufcBact', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">UFC Fungos</label>
                  <input
                    type="number"
                    placeholder="—"
                    className={`${inputClass()} text-center`}
                    value={input.ufcFung || ''}
                    onChange={e => handleInputChange(laudo._id, 'ufcFung', e.target.value)}
                  />
                </div>

              </div>

              {/* Responsável + Intercorrência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Responsável pela Leitura</label>
                  <input
                    type="text"
                    placeholder="Nome / Matrícula"
                    className={inputClass()}
                    value={input.responsavelLeitura || ''}
                    onChange={e => handleInputChange(laudo._id, 'responsavelLeitura', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-bold">Intercorrência c/ Amostra</label>
                  <select
                    className={`${inputClass('amber')} ${input.intercorrencia !== 'Nenhuma' ? 'text-amber-400' : 'text-slate-400'} font-bold`}
                    value={input.intercorrencia || 'Nenhuma'}
                    onChange={e => handleInputChange(laudo._id, 'intercorrencia', e.target.value)}
                  >
                    {INTERCORRENCIAS.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {/* Upload */}
              <UploadLaudo
                laudoId={laudo._id}
                arquivos={laudo.arquivos || []}
                onAtualizar={handleAtualizarLaudo}
              />
            </div>

          </div>
        );
      })}
    </div>
  );
}
