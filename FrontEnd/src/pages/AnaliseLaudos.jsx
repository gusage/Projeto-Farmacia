// frontend/src/pages/AnaliseLaudos.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AnaliseLaudos() {
    const [laudos, setLaudos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState('');

    // Estado para controlar os inputs de cada card individualmente
    const [inputs, setInputs] = useState({});

    useEffect(() => {
        async function buscarPendentes() {
            try {
                const response = await api.get('/laudos/consultar?status=Pendente Análise');
                setLaudos(response.data);
                
                // Inicializa os campos de input para cada laudo carregado
                const initialInputs = {};
                response.data.forEach(l => {
                    initialInputs[l._id] = {
                        numeroLaudo: '',
                        resultadoFinal: 'Aprovado',
                        ufcBact: '',
                        ufcFung: '',
                        responsavelLeitura: ''
                    };
                });
                setInputs(initialInputs);
            } catch (error) {
                console.error("Erro ao carregar análises:", error);
            } finally {
                setCarregando(false);
            }
        }
        buscarPendentes();
    }, []);

    const handleInputChange = (id, campo, valor) => {
        setInputs(prev => ({
            ...prev,
            [id]: { ...prev[id], [campo]: valor }
        }));
    };

    const confirmarRecebimento = async (id) => {
        const dados = inputs[id];
        try {
            // Enviamos os dados técnicos para o backend salvar no Atlas
            await api.put(`/laudos/atualizar/${id}`, {
                status: dados.resultadoFinal === 'Aprovado' ? 'Conforme' : 'Inconforme',
                numeroLaudo: dados.numeroLaudo,
                ufcBactérias: dados.ufcBact,
                ufcFungos: dados.ufcFung,
                responsavelLeitura: dados.responsavelLeitura,
                dataAnalise: new Date()
            });

            setMensagem("✅ Laudo técnico confirmado e arquivado no sistema!");
            setLaudos(laudos.filter(l => l._id !== id));
            setTimeout(() => setMensagem(''), 3000);
        } catch {
            alert("Erro ao confirmar recebimento.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        📋 Aguardando Laudo
                        <span className="bg-blue-900 text-blue-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {laudos.length} pendentes
                        </span>
                    </h1>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Registre o laudo de laboratório: nº do laudo, resultado final, UFC e status final.
                </p>

                {mensagem && (
                    <div className="bg-emerald-950/30 border border-emerald-800 text-emerald-400 p-3 rounded text-xs font-bold animate-pulse">
                        {mensagem}
                    </div>
                )}

                {carregando ? (
                    <div className="text-slate-500 text-xs animate-pulse">Sincronizando com Atlas...</div>
                ) : laudos.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
                        Nenhum laudo aguardando leitura no momento. ✨
                    </div>
                ) : (
                    <div className="space-y-4">
                        {laudos.map((laudo) => (
                            <div key={laudo._id} className="bg-[#161b22] border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors">
                                
                                {/* Topo do Card: Badges e Timer */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        <span className="bg-blue-900/40 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Fluxo</span>
                                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Cont.</span>
                                        <span className="bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Grau A</span>
                                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">S1 Hormônios</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1 justify-end">
                                            ⏳ Aguardando Laudo — <span className="text-slate-300">43 restantes</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Info da Coleta */}
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold text-slate-200">{laudo.sala || 'Bancada fluxo laminar'} — {laudo.pontoId || 'Lado Esquerdo'}</h2>
                                    <div className="flex gap-4 mt-1 text-[10px] text-slate-500 uppercase font-medium">
                                        <span>Coleta: <b className="text-slate-400">{new Date(laudo.createdAt).toLocaleDateString()}</b></span>
                                        <span>Prazo: <b className="text-slate-400">31/05/2026</b></span>
                                        <span>Lote: <b className="text-slate-400">{laudo.lote || '2026-05-26'}</b></span>
                                    </div>
                                </div>

                                {/* INPUTS DE ANÁLISE (Grid igual da foto) */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-slate-500 uppercase font-bold">Nº do Laudo</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: LAU-2026-045"
                                            className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-[11px] outline-none focus:border-blue-500 transition-colors"
                                            value={inputs[laudo._id]?.numeroLaudo}
                                            onChange={(e) => handleInputChange(laudo._id, 'numeroLaudo', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] text-slate-500 uppercase font-bold">Resultado Final</label>
                                        <select 
                                            className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-[11px] outline-none focus:border-blue-500 text-blue-400 font-bold"
                                            value={inputs[laudo._id]?.resultadoFinal}
                                            onChange={(e) => handleInputChange(laudo._id, 'resultadoFinal', e.target.value)}
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
                                            className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-center text-[11px] outline-none focus:border-blue-500"
                                            value={inputs[laudo._id]?.ufcBact}
                                            onChange={(e) => handleInputChange(laudo._id, 'ufcBact', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] text-slate-500 uppercase font-bold">UFC Fungos</label>
                                        <input 
                                            type="number" 
                                            placeholder="--"
                                            className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-center text-[11px] outline-none focus:border-blue-500"
                                            value={inputs[laudo._id]?.ufcFung}
                                            onChange={(e) => handleInputChange(laudo._id, 'ufcFung', e.target.value)}
                                        />
                                    </div>

                                    <button 
                                        onClick={() => confirmarRecebimento(laudo._id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2.5 rounded shadow-lg uppercase tracking-wider transition-transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span>✅</span> Confirmar Recebimento
                                    </button>
                                </div>

                                {/* Footer do Card: Responsável pela Leitura */}
                                <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-1">
                                    <label className="text-[9px] text-slate-600 uppercase font-bold">Responsável pela Leitura</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nome / Matrícula"
                                        className="w-full md:w-64 bg-transparent border-b border-slate-800 text-[10px] text-slate-400 outline-none focus:border-slate-600 pb-1"
                                        value={inputs[laudo._id]?.responsavelLeitura}
                                        onChange={(e) => handleInputChange(laudo._id, 'responsavelLeitura', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}