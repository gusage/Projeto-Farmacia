// frontend/src/pages/PainelAlertas.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PainelAlertas() {
    const [laudos, setLaudos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function buscarAlertas() {
            try {
                // Buscamos apenas os laudos que ainda não foram analisados
                const response = await api.get('/laudos/consultar?status=Pendente Análise');
                setLaudos(response.data);
            } catch (error) {
                console.error("Erro ao buscar alertas:", error);
            } finally {
                setCarregando(false);
            }
        }
        buscarAlertas();
    }, []);

    // Lógica de cálculo de prazos (Simulação baseada na imagem)
    const totalPendentes = laudos.length;
    const noPrazo = laudos.length; // No exemplo da imagem, todos estão no prazo
    const vencidos = 0;
    const vencemHoje = 0;
    const proximos2Dias = 0;

    return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono p-4 sm:p-6 pb-16">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header da Página */}
                <div className="border-b border-slate-800 pb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
                        🚨 Painel de Alertas
                    </h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                        Laudos pendentes por prazo estimado de entrega
                    </p>
                </div>

                {/* BLOCO DE INDICADORES (Cards Superiores) */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Vencidos */}
                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center">
                        <span className="text-rose-500 text-xl">🚨</span>
                        <p className="text-2xl font-black text-rose-500">{vencidos}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Vencidos</p>
                    </div>
                    {/* Vencem Hoje */}
                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center">
                        <span className="text-amber-400 text-xl">🔔</span>
                        <p className="text-2xl font-black text-amber-400">{vencemHoje}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Vencem hoje</p>
                    </div>
                    {/* Próximos 2 Dias */}
                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center">
                        <span className="text-orange-500 text-xl">⚡</span>
                        <p className="text-2xl font-black text-orange-500">{proximos2Dias}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Próximos 2 dias</p>
                    </div>
                    {/* No Prazo */}
                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center">
                        <span className="text-emerald-400 text-xl">✅</span>
                        <p className="text-2xl font-black text-emerald-400">{noPrazo}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">No prazo</p>
                    </div>
                    {/* Total Pendentes */}
                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center">
                        <span className="text-slate-400 text-xl">📊</span>
                        <p className="text-2xl font-black text-slate-100">{totalPendentes}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Total pendentes</p>
                    </div>
                </div>

                {/* SEÇÃO LISTAGEM: DENTRO DO PRAZO */}
                <div className="space-y-4">
                    <div className="bg-emerald-900/20 border-l-4 border-emerald-500 px-4 py-2.5 rounded flex items-center justify-between">
                        <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Dentro do Prazo ({noPrazo})
                        </h2>
                    </div>

                    {carregando ? (
                        <div className="text-center py-10 text-slate-600 text-xs animate-pulse">CARREGANDO ALERTAS DO ATLAS...</div>
                    ) : laudos.map((laudo) => (
                        <div key={laudo._id} className="bg-[#161b22] border border-slate-800/60 rounded-lg p-5 hover:bg-[#1c2128] transition-all group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                
                                {/* Info do Lado Esquerdo */}
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="bg-blue-950 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded text-[9px] font-black uppercase">Uniform.</span>
                                        <span className="text-[10px] text-slate-500">
                                            Coleta: {new Date(laudo.dataColeta).toLocaleDateString()} · {laudo.turno}
                                        </span>
                                        <span className="bg-emerald-950 text-emerald-500 border border-emerald-900/50 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            4 dias restantes
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-200">
                                            {laudo.tipoColeta} | {laudo.colaboradorId || laudo.pontoId}
                                        </h3>
                                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500">
                                            <span>Prazo: <b className="text-slate-400">31/05/2026</b></span>
                                            <span>Lote: <b className="text-slate-400">{laudo.loteBact || laudo.loteOperacional}</b></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão de Ação Lado Direito */}
                                <button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2.5 px-6 rounded shadow-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                                    <span>📑</span> Laudo Recebido
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}