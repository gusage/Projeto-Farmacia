// src/pages/ColetaForm.jsx
import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TIPOS_COLETA,
  TIPOS_PESSOAL,
  PONTOS_AMBIENTAIS,
  calcularPrazo
} from '../utils/laudoHelpers';

const TOTAL_COLABORADORES = 13;

// ── HELPERS ────────────────────────────────────────────────────────────────────

function inicializarAmbiental() {
  return PONTOS_AMBIENTAIS.flatMap(g => g.pontos).reduce(
    (acc, p) => ({ ...acc, [p.id]: { lote: '', obs: '' } }), {}
  );
}

function inicializarColaboradores() {
  return Array.from({ length: TOTAL_COLABORADORES }, (_, i) => {
    const id = `colaborador_${String(i + 1).padStart(2, '0')}`;
    return [id, { nomeCustom: '', loteBact: '', loteFung: '', obs: '' }];
  }).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

// ── COMPONENTES INTERNOS ────────────────────────────────────────────────────────

function CampoInput({ value, onChange, placeholder = '--', className = '' }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 ${className}`}
    />
  );
}

function LinhaAmbiental({ ponto, valores, onChange }) {
  return (
    <div className="bg-[#161b22]/50 border border-slate-800 p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
      <div>
        <div className="flex items-center gap-2">
          <span className={`${ponto.badge} px-1.5 py-0.5 rounded text-[10px] font-bold border`}>{ponto.grau}</span>
          <span className="font-medium text-slate-200">{ponto.titulo}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Limite: {ponto.limite}</p>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <div className="w-1/2 md:w-32">
          <CampoInput value={valores.lote} onChange={v => onChange('lote', v)} placeholder="Lote" />
        </div>
        <div className="w-1/2 md:w-40">
          <CampoInput value={valores.obs} onChange={v => onChange('obs', v)} placeholder="Obs." />
        </div>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────────

export default function ColetaForm() {
  const { user } = useAuth();

  const hoje = new Date().toISOString().split('T')[0];

  const [tipoColeta,  setTipoColeta]  = useState('Sedimentação - Bactérias');
  const [dataColeta,  setDataColeta]  = useState(hoje); // data atual, não hardcoded
  const [turno,       setTurno]       = useState('Manhã');
  const [responsavel, setResponsavel] = useState(user?.nome || ''); // vem do usuário logado

  const [mensagem,  setMensagem]  = useState({ tipo: '', texto: '' });
  const [enviando,  setEnviando]  = useState(false);

  const [valoresAmbiental, setValoresAmbiental] = useState(inicializarAmbiental);
  const [valoresPessoal,   setValoresPessoal]   = useState(inicializarColaboradores);

  const ehPessoal = TIPOS_PESSOAL.includes(tipoColeta);

  const handleAmbientalChange = (pontoId, campo, valor) =>
    setValoresAmbiental(prev => ({ ...prev, [pontoId]: { ...prev[pontoId], [campo]: valor } }));

  const handlePessoalChange = (colabId, campo, valor) =>
    setValoresPessoal(prev => ({ ...prev, [colabId]: { ...prev[colabId], [campo]: valor } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensagem({ tipo: '', texto: '' });

    const amostras = ehPessoal
      ? Object.entries(valoresPessoal)
          .map(([, v], i) => ({
            colaboradorId: v.nomeCustom.trim() || `Colaborador ${String(i + 1).padStart(2, '0')}`,
            loteBact: v.loteBact,
            loteFung: v.loteFung,
            observacoesCampo: v.obs,
          }))
          .filter(a => a.loteBact || a.loteFung)
      : Object.entries(valoresAmbiental)
          .map(([pontoId, v]) => ({ pontoId, loteOperacional: v.lote, observacoesCampo: v.obs }))
          .filter(a => a.loteOperacional);

    if (amostras.length === 0) {
      setMensagem({ tipo: 'erro', texto: '⚠️ Insira o lote em pelo menos uma linha antes de enviar.' });
      setEnviando(false);
      return;
    }

    try {
      await api.post('/laudos/registrar-lote', {
        tipoColeta,
        dataColeta,
        turno,
        responsavelColeta: responsavel,
        statusGeral: 'Pendente Análise',
        amostras,
      });

      setMensagem({ tipo: 'sucesso', texto: '✅ Registros salvos e enviados para a Fila de Análise!' });
      setValoresAmbiental(inicializarAmbiental());
      setValoresPessoal(inicializarColaboradores());
    } catch {
      setMensagem({ tipo: 'erro', texto: '❌ Erro ao salvar no Atlas. Tente novamente.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
          📋 Registrar Coleta
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Preencha os dados da coleta. Os valores de UFC serão informados apenas no recebimento do laudo.
        </p>
      </div>

      {/* Flash */}
      {mensagem.texto && (
        <div className={`p-4 rounded-lg text-xs font-bold border ${
          mensagem.tipo === 'sucesso'
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
            : 'bg-rose-950/40 text-rose-400 border-rose-800'
        }`}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Dados Gerais */}
        <div className="border border-slate-800 bg-[#161b22] p-5 rounded-lg space-y-4">
          <h2 className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Dados Gerais da Coleta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Tipo de Coleta</label>
              <select
                className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                value={tipoColeta} onChange={e => setTipoColeta(e.target.value)}
              >
                {TIPOS_COLETA.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Data da Coleta</label>
              <input
                type="date"
                className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                value={dataColeta}
                onChange={e => setDataColeta(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Turno</label>
              <select
                className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                value={turno} onChange={e => setTurno(e.target.value)}
              >
                {['Manhã', 'Tarde', 'Noite'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Responsável pela Coleta</label>
              <input
                type="text"
                className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                value={responsavel}
                onChange={e => setResponsavel(e.target.value)}
              />
            </div>
          </div>

          {/* Prazo calculado dinamicamente */}
          <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
            📅 Prazo estimado do laudo:{' '}
            <strong className="text-amber-400">{calcularPrazo(dataColeta)}</strong>
          </p>
        </div>

        {/* Aviso Mãos sem Luva */}
        {tipoColeta === 'Mãos sem Luva' && (
          <div className="bg-amber-950/40 border border-amber-800 text-amber-500 p-3.5 rounded-lg text-xs font-semibold tracking-wide">
            ⚠️ Coleta semanal — Colaboradores escolhidos aleatoriamente. Informe o nome do colaborador sorteado em cada linha utilizada.
          </div>
        )}

        {/* Universo A: Ambiental */}
        {!ehPessoal && (
          <div className="space-y-6">
            {PONTOS_AMBIENTAIS.map(grupo => (
              <div key={grupo.grupo} className="space-y-3">
                <div className={`bg-[#161b22] px-4 py-2 rounded border-l-4 text-xs font-bold uppercase tracking-wider ${grupo.cor}`}>
                  {grupo.grupo}
                </div>
                {grupo.pontos.map(ponto => (
                  <LinhaAmbiental
                    key={ponto.id}
                    ponto={ponto}
                    valores={valoresAmbiental[ponto.id]}
                    onChange={(campo, valor) => handleAmbientalChange(ponto.id, campo, valor)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Universo B: Pessoal */}
        {ehPessoal && (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-3 px-4 text-[10px] text-emerald-500 uppercase tracking-widest font-black pb-1">
              <div className="col-span-4">Colaborador</div>
              <div className="col-span-3">Lote Bact.</div>
              <div className="col-span-3">Lote Fung.</div>
              <div className="col-span-2">Obs.</div>
            </div>

            {Object.keys(valoresPessoal).map((id, index) => {
              const label = `Colaborador ${String(index + 1).padStart(2, '0')}`;
              const permiteNome = tipoColeta === 'Mãos sem Luva';
              const v = valoresPessoal[id];
              return (
                <div key={id} className="grid grid-cols-12 gap-3 bg-[#161b22]/70 border border-slate-800/80 p-2.5 rounded items-center">
                  <div className="col-span-4 text-xs font-bold text-slate-300">
                    {permiteNome
                      ? <CampoInput value={v.nomeCustom} onChange={val => handlePessoalChange(id, 'nomeCustom', val)} placeholder={label} className="focus:border-amber-500" />
                      : <span className="px-1 block text-slate-200">{label}</span>
                    }
                  </div>
                  <div className="col-span-3">
                    <CampoInput value={v.loteBact} onChange={val => handlePessoalChange(id, 'loteBact', val)} />
                  </div>
                  <div className="col-span-3">
                    <CampoInput value={v.loteFung} onChange={val => handlePessoalChange(id, 'loteFung', val)} />
                  </div>
                  <div className="col-span-2">
                    <CampoInput value={v.obs} onChange={val => handlePessoalChange(id, 'obs', val)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-lg hover:bg-emerald-500 active:scale-[0.99] transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
        >
          <span>💾</span> {enviando ? 'Processando Lote...' : 'Salvar Coleta'}
        </button>

      </form>
    </div>
  );
}
