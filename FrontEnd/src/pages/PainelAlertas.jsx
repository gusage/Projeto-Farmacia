// src/pages/PainelAlertas.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { calcularDiasRestantes } from '../utils/laudoHelpers';

function classificarLaudo(dias) {
  if (dias < 0)  return 'vencido';
  if (dias === 0) return 'hoje';
  if (dias <= 2)  return 'proximo';
  return 'noPrazo';
}

function BadgePrazo({ dias }) {
  if (dias < 0)
    return <span className="bg-rose-950 text-rose-400 border border-rose-900/50 px-2 py-0.5 rounded text-[9px] font-black uppercase">Vencido há {Math.abs(dias)}d</span>;
  if (dias === 0)
    return <span className="bg-amber-950 text-amber-400 border border-amber-900/50 px-2 py-0.5 rounded text-[9px] font-black uppercase">Vence hoje</span>;
  if (dias <= 2)
    return <span className="bg-orange-950 text-orange-400 border border-orange-900/50 px-2 py-0.5 rounded text-[9px] font-black uppercase">{dias}d restantes ⚡</span>;
  return <span className="bg-emerald-950 text-emerald-500 border border-emerald-900/50 px-2 py-0.5 rounded text-[9px] font-black uppercase">{dias} dias restantes</span>;
}

const INDICADORES = [
  { key: 'vencido',  label: 'Vencidos',        icon: '🚨', cor: 'text-rose-500'    },
  { key: 'hoje',     label: 'Vencem hoje',      icon: '🔔', cor: 'text-amber-400'   },
  { key: 'proximo',  label: 'Próximos 2 dias',  icon: '⚡', cor: 'text-orange-500'  },
  { key: 'noPrazo',  label: 'No prazo',         icon: '✅', cor: 'text-emerald-400' },
  { key: 'total',    label: 'Total pendentes',  icon: '📊', cor: 'text-slate-100'   },
];

export default function PainelAlertas() {
  const [laudos, setLaudos]       = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]           = useState('');

  useEffect(() => {
    async function buscarAlertas() {
      try {
        const response = await api.get('/laudos/consultar?status=Pendente Análise');
        setLaudos(response.data);
      } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        setErro('Não foi possível carregar os alertas. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    }
    buscarAlertas();
  }, []);

  // Contadores calculados a partir dos dados reais
  const contadores = laudos.reduce(
    (acc, laudo) => {
      const dias = calcularDiasRestantes(laudo.dataPrazo);
      const classe = classificarLaudo(dias);
      acc[classe] = (acc[classe] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { vencido: 0, hoje: 0, proximo: 0, noPrazo: 0, total: 0 }
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
          🚨 Painel de Alertas
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
          Laudos pendentes por prazo estimado de entrega
        </p>
      </div>

      {/* Cards Indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {INDICADORES.map(({ key, label, icon, cor }) => (
          <div key={key} className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center">
            <span className="text-xl">{icon}</span>
            <p className={`text-2xl font-black ${cor}`}>{contadores[key]}</p>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{label}</p>
          </div>
        ))}
      </div>

      {/* Listagem */}
      <div className="space-y-4">
        <div className="bg-emerald-900/20 border-l-4 border-emerald-500 px-4 py-2.5 rounded flex items-center justify-between">
          <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Dentro do Prazo ({contadores.noPrazo})
          </h2>
        </div>

        {/* Estados: carregando / erro / vazio / lista */}
        {carregando && (
          <div className="text-center py-10 text-slate-600 text-xs animate-pulse">
            CARREGANDO ALERTAS DO ATLAS...
          </div>
        )}

        {!carregando && erro && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/60 text-rose-400 rounded text-xs font-bold uppercase tracking-wide">
            ⚠️ {erro}
          </div>
        )}

        {!carregando && !erro && laudos.length === 0 && (
          <div className="text-center py-10 text-slate-600 text-xs uppercase tracking-widest">
            Nenhum laudo pendente encontrado.
          </div>
        )}

        {!carregando && !erro && laudos.map((laudo) => {
          const dias = calcularDiasRestantes(laudo.dataPrazo);
          return (
            <div key={laudo._id} className="bg-[#161b22] border border-slate-800/60 rounded-lg p-5 hover:bg-[#1c2128] transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-950 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                      Uniform.
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Coleta: {new Date(laudo.dataColeta).toLocaleDateString('pt-BR')} · {laudo.turno}
                    </span>
                    <BadgePrazo dias={dias} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-200">
                      {laudo.tipoColeta} | {laudo.colaboradorId || laudo.pontoId}
                    </h3>
                    <div className="flex gap-4 mt-1 text-[10px] text-slate-500">
                      <span>Prazo: <b className="text-slate-400">
                        {laudo.dataPrazo
                          ? new Date(laudo.dataPrazo).toLocaleDateString('pt-BR')
                          : '—'}
                      </b></span>
                      <span>Lote: <b className="text-slate-400">{laudo.loteBact || laudo.loteOperacional || '—'}</b></span>
                    </div>
                  </div>
                </div>

                <button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2.5 px-6 rounded shadow-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  <span>📑</span> Laudo Recebido
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
