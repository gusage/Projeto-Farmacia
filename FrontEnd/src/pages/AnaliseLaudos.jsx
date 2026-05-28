// src/pages/AnaliseLaudos.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function calcularDiasRestantes(dataPrazo) {
  if (!dataPrazo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = new Date(dataPrazo);
  prazo.setHours(0, 0, 0, 0);
  return Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
}

function BadgePrazo({ dias }) {
  if (dias === null) return null;
  if (dias < 0)
    return <span className="text-rose-400 font-bold text-[9px] uppercase">⏳ Vencido há {Math.abs(dias)}d</span>;
  if (dias === 0)
    return <span className="text-amber-400 font-bold text-[9px] uppercase">⏳ Vence hoje</span>;
  return <span className="text-amber-500 font-bold text-[9px] uppercase">⏳ {dias} dias restantes</span>;
}

function inputClass(focusColor = 'blue') {
  return `w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-[11px] outline-none focus:border-${focusColor}-500 transition-colors`;
}

export default function AnaliseLaudos() {
  const { user } = useAuth();
  const [laudos,    setLaudos]    = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem,  setMensagem]  = useState({ tipo: '', texto: '' });
  const [inputs,    setInputs]    = useState({});

  useEffect(() => {
    async function buscarPendentes() {
      try {
        const response = await api.get('/laudos/consultar?status=Pendente Análise');
        setLaudos(response.data);

        // Pré-preenche responsável com usuário logado
        const init = {};
        response.data.forEach(l => {
          init[l._id] = {
            numeroLaudo:        '',
            resultadoFinal:     'Aprovado',
            ufcBact:            '',
            ufcFung:            '',
            responsavelLeitura: user?.nome || '',
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

  const confirmarRecebimento = async (id) => {
    const dados = inputs[id];
    setMensagem({ tipo: '', texto: '' });

    try {
      await api.put(`/laudos/atualizar/${id}`, {
        status:             dados.resultadoFinal === 'Aprovado' ? 'Conforme' : 'Inconforme',
        numeroLaudo:        dados.numeroLaudo,
        ufcBacterias:       Number(dados.ufcBact)  || null,  // sem acento, alinhado ao model
        ufcFungos:          Number(dados.ufcFung)  || null,
        responsavelLeitura: dados.responsavelLeitura,
        dataAnalise:        new Date(),
      });

      setMensagem({ tipo: 'sucesso', texto: '✅ Laudo confirmado e arquivado com sucesso!' });
      setLaudos(prev => prev.filter(l => l._id !== id));
    } catch {
      setMensagem({ tipo: 'erro', texto: '❌ Erro ao confirmar recebimento. Tente novamente.' });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-200">
            📋 Aguardando Laudo
            <span className="bg-blue-900 text-blue-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {laudos.length} pendentes
            </span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
            Registre o nº do laudo, resultado final, UFC e status.
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

      {/* Estados */}
      {carregando && (
        <div className="text-slate-500 text-xs animate-pulse">Sincronizando com Atlas...</div>
      )}

      {!carregando && laudos.length === 0 && !mensagem.texto && (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
          Nenhum laudo aguardando leitura no momento. ✨
        </div>
      )}

      {/* Cards */}
      {!carregando && laudos.map((laudo) => {
        const dias = calcularDiasRestantes(laudo.dataPrazo);
        const input = inputs[laudo._id] || {};

        return (
          <div key={laudo._id} className="bg-[#161b22] border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors">

            {/* Topo: badges dinâmicos */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-900/40 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                  {laudo.tipoColeta}
                </span>
                {laudo.pontoId && (
                  <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    {laudo.pontoId}
                  </span>
                )}
                {laudo.colaboradorId && (
                  <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    {laudo.colaboradorId}
                  </span>
                )}
              </div>
              <BadgePrazo dias={dias} />
            </div>

            {/* Info */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-200">
                {laudo.tipoColeta} — {laudo.pontoId || laudo.colaboradorId || '—'}
              </h2>
              <div className="flex flex-wrap gap-4 mt-1 text-[10px] text-slate-500 uppercase font-medium">
                <span>Coleta: <b className="text-slate-400">{new Date(laudo.dataColeta).toLocaleDateString('pt-BR')}</b></span>
                <span>Prazo: <b className="text-slate-400">
                  {laudo.dataPrazo ? new Date(laudo.dataPrazo).toLocaleDateString('pt-BR') : '—'}
                </b></span>
                <span>Lote: <b className="text-slate-400">
                  {laudo.loteBact || laudo.loteOperacional || '—'}
                </b></span>
              </div>
            </div>

            {/* Inputs de análise */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Nº do Laudo</label>
                <input
                  type="text"
                  placeholder="Ex: LAU-2026-045"
                  className={inputClass()}
                  value={input.numeroLaudo || ''}
                  onChange={e => handleInputChange(laudo._id, 'numeroLaudo', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Resultado Final</label>
                <select
                  className={`${inputClass()} text-blue-400 font-bold`}
                  value={input.resultadoFinal || 'Aprovado'}
                  onChange={e => handleInputChange(laudo._id, 'resultadoFinal', e.target.value)}
                >
                  <option value="Aprovado">Aprovado</option>
                  <option value="Reprovado">Reprovado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold">UFC Bactérias</label>
                <input
                  type="number"
                  placeholder="--"
                  className={`${inputClass()} text-center`}
                  value={input.ufcBact || ''}
                  onChange={e => handleInputChange(laudo._id, 'ufcBact', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold">UFC Fungos</label>
                <input
                  type="number"
                  placeholder="--"
                  className={`${inputClass()} text-center`}
                  value={input.ufcFung || ''}
                  onChange={e => handleInputChange(laudo._id, 'ufcFung', e.target.value)}
                />
              </div>

              <button
                onClick={() => confirmarRecebimento(laudo._id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2.5 rounded shadow-lg uppercase tracking-wider transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>✅</span> Confirmar Recebimento
              </button>
            </div>

            {/* Responsável pela leitura */}
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-1">
              <label className="text-[9px] text-slate-600 uppercase font-bold">Responsável pela Leitura</label>
              <input
                type="text"
                placeholder="Nome / Matrícula"
                className="w-full md:w-64 bg-transparent border-b border-slate-800 text-[10px] text-slate-400 outline-none focus:border-slate-600 pb-1"
                value={input.responsavelLeitura || ''}
                onChange={e => handleInputChange(laudo._id, 'responsavelLeitura', e.target.value)}
              />
            </div>

          </div>
        );
      })}
    </div>
  );
}
