// frontend/src/pages/AnaliseLaudos.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AnaliseLaudos() {
    const [laudos, setLaudos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState('');

    // CORREÇÃO: Colocamos a lógica de busca isolada e segura dentro do useEffect
    useEffect(() => {
        let ativo = true; // Flag para evitar atualizações de estado se o componente for desmontado

        async function carregarDados() {
            try {
                const response = await api.get('/laudos/consultar?status=Pendente Análise');
                if (ativo) {
                    setLaudos(response.data);
                }
            } catch (error) {
                console.error("Erro ao buscar laudos do BioCount:", error);
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarDados();

        // Função de limpeza (cleanup) do React
        return () => {
            ativo = false;
        };
    }, []); // Array de dependências vazio para rodar apenas uma vez ao carregar a página

    // Mantemos a função de validar aqui fora, pois ela é disparada por um clique de botão (evento do usuário)
    const validarLaudo = async (id, novoStatus) => {
        try {
            const response = await api.put(`/laudos/atualizar/${id}`, { status: novoStatus });
            console.log("Resposta do servidor ao atualizar:", response.data);
            setMensagem(`Laudo atualizado para ${novoStatus} com sucesso!`);
            setLaudos(prevLaudos => prevLaudos.filter(l => l._id !== id));
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error("Erro detalhado ao atualizar status no Atlas:", error);
            alert(`Não foi possível salvar a análise. Erro: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header Corporativo */}
            <div className="bg-slate-900 text-white p-6 shadow-md border-b-4 border-emerald-500">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-emerald-400">Central de Análise</h1>
                        <p className="text-slate-400 text-xs">Liberação Técnica de Laudos Ambientais</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8 px-4">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    📥 Coletas Aguardando Revisão 
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-sm">{laudos.length}</span>
                </h2>

                {mensagem && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-bold animate-bounce">
                        {mensagem}
                    </div>
                )}

                {carregando ? (
                    <p className="text-slate-500 animate-pulse">Consultando base do Atlas...</p>
                ) : laudos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Não há coletas pendentes de análise no momento. ✨</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {laudos.map((laudo) => (
                            <div key={laudo._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Topo do Card: Tipo de Coleta */}
                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                                    <span className="font-bold text-slate-700 text-sm uppercase">{laudo.tipoColeta}</span>
                                    <span className="text-[10px] font-mono text-slate-400 italic">ID: {laudo._id.slice(-6)}</span>
                                </div>

                                {/* Corpo do Card */}
                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Localização</p>
                                            <p className="text-sm font-semibold text-slate-800">{laudo.sala || 'N/A'}</p>
                                            <p className="text-xs text-slate-500">{laudo.area || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Contagem Bruta</p>
                                            <p className="text-2xl font-black text-emerald-600">{laudo.ufcEncontrado} <small className="text-xs font-normal">UFC</small></p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-50">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Responsável pela Coleta</p>
                                        <p className="text-xs text-slate-600">Técnica: {laudo.usuario?.nome || 'Beatriz Silva'}</p>
                                        <p className="text-[10px] text-slate-400">{new Date(laudo.createdAt).toLocaleString('pt-BR')}</p>
                                    </div>

                                    {laudo.observacoes && (
                                        <div className="p-2 bg-amber-50 rounded text-xs italic text-amber-700 border-l-2 border-amber-300">
                                            "{laudo.observacoes}"
                                        </div>
                                    )}

                                    {/* AÇÕES DA FARMACÊUTICA */}
                                    <div className="pt-4 flex flex-col gap-2">
                                        <p className="text-[10px] uppercase font-black text-slate-500 text-center mb-1">Definir Parecer Técnico</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button 
                                                onClick={() => validarLaudo(laudo._id, 'Conforme')}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 rounded shadow-sm transition-colors"
                                            >
                                                CONFORME
                                            </button>
                                            <button 
                                                onClick={() => validarLaudo(laudo._id, 'Alerta')}
                                                className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold py-2 rounded shadow-sm transition-colors"
                                            >
                                                ALERTA
                                            </button>
                                            <button 
                                                onClick={() => validarLaudo(laudo._id, 'Inconforme')}
                                                className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-2 rounded shadow-sm transition-colors"
                                            >
                                                INCONFORME
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}