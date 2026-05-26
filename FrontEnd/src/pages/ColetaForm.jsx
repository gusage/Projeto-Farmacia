// frontend/src/pages/ColetaForm.jsx
import { useState } from 'react';
import api from '../services/api';

export default function ColetaForm() {
    // 1. Estados Gerais
    const [tipoColeta, setTipoColeta] = useState('Sedimentação - Bactérias');
    const [dataColeta, setDataColeta] = useState('2026-05-26');
    const [turno, setTurno] = useState('Manhã');
    const [responsavel, setResponsavel] = useState('Carol');
    
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [enviando, setEnviando] = useState(false);
    const prazoEstimado = "31/05/2026";

    // 2. Estado para Monitoramento Ambiental (Salas e Bancadas)
    const [valoresAmbiental, setValoresAmbiental] = useState({
        'lavacao_pia': { lote: '', obs: '' },
        'lavacao_central': { lote: '', obs: '' },
        'geral_direito': { lote: '', obs: '' },
        'geral_esquerdo': { lote: '', obs: '' },
        'fluxo_direito': { lote: '', obs: '' },
        'fluxo_meio': { lote: '', obs: '' },
        'fluxo_esquerdo': { lote: '', obs: '' },
        'geral_pulo': { lote: '', obs: '' },
    });

    // 3. Estado para Monitoramento de Pessoal (Colaboradores - Gera 13 linhas por padrão)
    const inicializarColaboradores = () => {
        const estadoInicial = {};
        for (let i = 1; i <= 13; i++) {
            const id = `colaborador_${String(i).padStart(2, '0')}`;
            estadoInicial[id] = { nomeCustom: '', loteBact: '', loteFung: '', obs: '' };
        }
        return estadoInicial;
    };
    const [valoresPessoal, setValoresPessoal] = useState(inicializarColaboradores());

    // Identificadores de layout helper
    const ehMonitoramentoPessoal = ['Toque de Luvas', 'Mãos sem Luva', 'Uniforme Estéril'].includes(tipoColeta);

    // Handlers de Input
    const handleAmbientalChange = (pontoId, campo, valor) => {
        setValoresAmbiental(prev => ({
            ...prev,
            [pontoId]: { ...prev[pontoId], [campo]: valor }
        }));
    };

    const handlePessoalChange = (colabId, campo, valor) => {
        setValoresPessoal(prev => ({
            ...prev,
            [colabId]: { ...prev[colabId], [campo]: valor }
        }));
    };

    // Submissão Inteligente do Formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensagem({ tipo: '', texto: '' });

        let amostrasTratadas;

        if (ehMonitoramentoPessoal) {
            // Mapeia o pessoal para o payload do backend
            amostrasTratadas = Object.keys(valoresPessoal).map((chave, index) => {
                const labelOriginal = `Colaborador ${String(index + 1).padStart(2, '0')}`;
                // Se a técnica digitou um nome em "Mãos sem Luva", usa o nome customizado
                const identificadorFinal = valoresPessoal[chave].nomeCustom.trim() || labelOriginal;

                return {
                    colaboradorId: identificadorFinal,
                    loteBact: valoresPessoal[chave].loteBact,
                    loteFung: valoresPessoal[chave].loteFung,
                    observacoesCampo: valoresPessoal[chave].obs
                };
            }).filter(a => a.loteBact || a.loteFung); // Só envia se preencheu algum lote
        } else {
            // Mapeia o ambiental para o payload do backend
            amostrasTratadas = Object.keys(valoresAmbiental).map(chave => ({
                pontoId: chave,
                loteOperacional: valoresAmbiental[chave].lote,
                observacoesCampo: valoresAmbiental[chave].obs
            })).filter(a => a.loteOperacional);
        }

        if (amostrasTratadas.length === 0) {
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
                amostras: amostrasTratadas
            });

            setMensagem({ tipo: 'sucesso', texto: '✅ Registros de coleta salvos e enviados para a Fila de Análise!' });
            
            // Reseta os estados de entrada
            setValoresAmbiental(Object.keys(valoresAmbiental).reduce((acc, k) => ({ ...acc, [k]: { lote: '', obs: '' } }), {}));
            setValoresPessoal(inicializarColaboradores());
        } catch {
            setMensagem({ tipo: 'erro', texto: '❌ Ocorreu um erro ao salvar o lote de dados no Atlas.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono p-4 sm:p-6 pb-16">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Título Principal */}
                <div className="border-b border-slate-800 pb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
                        📋 Registrar Coleta
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Preencha os dados da coleta. Os valores de UFC serão informados apenas no recebimento do laudo do laboratório.
                    </p>
                </div>

                {/* Notificações Flash */}
                {mensagem.texto && (
                    <div className={`p-4 rounded-lg text-xs font-bold border ${
                        mensagem.tipo === 'sucesso' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-rose-950/40 text-rose-400 border-rose-800'
                    }`}>
                        {mensagem.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* CARD SUPERIOR: CONFIGURAÇÕES GERAIS */}
                    <div className="border border-slate-800 bg-[#161b22] p-5 rounded-lg space-y-4">
                        <h2 className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Dados Gerais da Coleta</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Tipo de Coleta</label>
                                <select 
                                    className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                                    value={tipoColeta} onChange={(e) => setTipoColeta(e.target.value)}
                                >
                                    <option>Sedimentação - Bactérias</option>
                                    <option>Sedimentação - Fungos</option>
                                    <option>Contato - Bactérias</option>
                                    <option>Contato - Fungos</option>
                                    <option>Toque de Luvas</option>
                                    <option>Mãos sem Luva</option>
                                    <option>Uniforme Estéril</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Data da Coleta</label>
                                <input type="date" className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none" value={dataColeta} onChange={(e) => setDataColeta(e.target.value)}/>
                            </div>

                            <div>
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Turno</label>
                                <select className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none" value={turno} onChange={(e) => setTurno(e.target.value)}>
                                    <option>Manhã</option>
                                    <option>Tarde</option>
                                    <option>Noite</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Responsável pela Coleta</label>
                                <input type="text" className="w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}/>
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                            <span>📅</span> Prazo estimado do laudo: <strong className="text-amber-400">{prazoEstimado}</strong>
                        </div>
                    </div>

                    {/* ALERTA LARANJA DO SORTEIO (Exclusivo de Mãos sem Luva) */}
                    {tipoColeta === 'Mãos sem Luva' && (
                        <div className="bg-amber-950/40 border border-amber-800 text-amber-500 p-3.5 rounded-lg text-xs font-semibold tracking-wide">
                            ⚠️ Coleta semanal — Colaboradores escolhidos aleatoriamente. Informe o nome do colaborador sorteado em cada linha utilizada.
                        </div>
                    )}


                    {/* UNIVERSO A: MONITORAMENTO AMBIENTAL (Layout de Salas) */}
                    {!ehMonitoramentoPessoal && (
                        <div className="space-y-6">
                            {/* Bloco Lavação */}
                            <div className="space-y-3">
                                <div className="bg-[#161b22] px-4 py-2 rounded border-l-4 border-purple-500 text-purple-400 text-xs font-bold uppercase tracking-wider">Lavação</div>
                                
                                <div className="bg-[#161b22]/50 border border-slate-800 p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                    <div>
                                        <div className="flex items-center gap-2"><span className="bg-purple-950 text-purple-400 border border-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Grau D</span><span className="font-medium text-slate-200">Bancada sala est. material limpo (PIA)</span></div>
                                        <p className="text-[10px] text-slate-500 mt-1">Limite: &lt; 50 UFC/PL</p>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <div className="w-1/2 md:w-32"><input type="text" placeholder="Lote" className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none" value={valoresAmbiental.lavacao_pia.lote} onChange={(e) => handleAmbientalChange('lavacao_pia', 'lote', e.target.value)}/></div>
                                        <div className="w-1/2 md:w-40"><input type="text" placeholder="Obs." className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none" value={valoresAmbiental.lavacao_pia.obs} onChange={(e) => handleAmbientalChange('lavacao_pia', 'obs', e.target.value)}/></div>
                                    </div>
                                </div>

                                <div className="bg-[#161b22]/50 border border-slate-800 p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                    <div>
                                        <div className="flex items-center gap-2"><span className="bg-purple-950 text-purple-400 border border-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Grau D</span><span className="font-medium text-slate-200">Bancada sala est. material limpo (BANCADA CENTRAL)</span></div>
                                        <p className="text-[10px] text-slate-500 mt-1">Limite: &lt; 50 UFC/PL</p>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <div className="w-1/2 md:w-32"><input type="text" placeholder="Lote" className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none" value={valoresAmbiental.lavacao_central.lote} onChange={(e) => handleAmbientalChange('lavacao_central', 'lote', e.target.value)}/></div>
                                        <div className="w-1/2 md:w-40"><input type="text" placeholder="Obs." className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none" value={valoresAmbiental.lavacao_central.obs} onChange={(e) => handleAmbientalChange('lavacao_central', 'obs', e.target.value)}/></div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco Sala 1 */}
                            <div className="space-y-3">
                                <div className="bg-[#161b22] px-4 py-2 rounded border-l-4 border-amber-500 text-amber-500 text-xs font-bold uppercase tracking-wider">Sala 1 — Geral</div>
                                {/* Mapeamento rápido resumido das outras linhas ambientais para encurtar */}
                                {[
                                    { id: 'geral_direito', g: 'Grau B', t: 'Bancada de manipulação geral · Lado Direito', lim: '&lt; 25 UFC/PL', c: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
                                    { id: 'geral_esquerdo', g: 'Grau B', t: 'Bancada de manipulação geral · Lado Esquerdo', lim: '&lt; 25 UFC/PL', c: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
                                    { id: 'fluxo_direito', g: 'Grau A', t: 'Bancada fluxo laminar · Lado Direito', lim: '0 UFC/PL (Grau A)', c: 'bg-teal-950 text-teal-400 border-teal-800' },
                                    { id: 'fluxo_meio', g: 'Grau A', t: 'Bancada fluxo laminar · Meio', lim: '0 UFC/PL (Grau A)', c: 'bg-teal-950 text-teal-400 border-teal-800' },
                                    { id: 'fluxo_esquerdo', g: 'Grau A', t: 'Bancada fluxo laminar · Lado Esquerdo', lim: '0 UFC/PL (Grau A)', c: 'bg-teal-950 text-teal-400 border-teal-800' },
                                    { id: 'geral_pulo', g: 'Grau C', t: 'Antecâmara entrada (BANCO DE PULO)', lim: '&lt; 25 UFC/PL', c: 'bg-orange-950 text-orange-400 border-orange-800' }
                                ].map(p => (
                                    <div key={p.id} className="bg-[#161b22]/50 border border-slate-800 p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                        <div>
                                            <div className="flex items-center gap-2"><span className={`${p.c} px-1.5 py-0.5 rounded text-[10px] font-bold`}>{p.g}</span><span className="font-medium text-slate-200">{p.t}</span></div>
                                            <p className="text-[10px] text-slate-500 mt-1">Limite: {p.lim}</p>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <div className="w-1/2 md:w-32"><input type="text" placeholder="Lote" className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none" value={valoresAmbiental[p.id].lote} onChange={(e) => handleAmbientalChange(p.id, 'lote', e.target.value)}/></div>
                                            <div className="w-1/2 md:w-40"><input type="text" placeholder="Obs." className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none" value={valoresAmbiental[p.id].obs} onChange={(e) => handleAmbientalChange(p.id, 'obs', e.target.value)}/></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* UNIVERSO B: MONITORAMENTO DE PESSOAL (Layout Grade) */}
                    {ehMonitoramentoPessoal && (
                        <div className="space-y-2">
                            {/* Títulos da Coluna */}
                            <div className="grid grid-cols-12 gap-3 px-4 text-[10px] text-emerald-500 uppercase tracking-widest font-black pb-1">
                                <div className="col-span-3 sm:col-span-4">Colaborador</div>
                                <div className="col-span-3">Lote Bact.</div>
                                <div className="col-span-3">Lote Fung.</div>
                                <div className="col-span-3 sm:col-span-2">Obs.</div>
                            </div>

                            {/* Renderização das Linhas Dinâmicas */}
                            {Object.keys(valoresPessoal).map((id, index) => {
                                const labelDefault = `Colaborador ${String(index + 1).padStart(2, '0')}`;
                                const permiteDigitarNome = tipoColeta === 'Mãos sem Luva';

                                return (
                                    <div key={id} className="grid grid-cols-12 gap-3 bg-[#161b22]/70 border border-slate-800/80 p-2.5 rounded items-center">
                                        
                                        {/* Coluna Nome do Colaborador */}
                                        <div className="col-span-3 sm:col-span-4 text-xs font-bold text-slate-300">
                                            {permiteDigitarNome ? (
                                                <input 
                                                    type="text" 
                                                    placeholder={labelDefault}
                                                    className="w-full bg-[#0d1117] border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                                                    value={valoresPessoal[id].nomeCustom}
                                                    onChange={(e) => handlePessoalChange(id, 'nomeCustom', e.target.value)}
                                                />
                                            ) : (
                                                <span className="px-2 pl-1 block text-slate-200">{labelDefault}</span>
                                            )}
                                        </div>

                                        {/* Coluna Lote Bactéria */}
                                        <div className="col-span-3">
                                            <input 
                                                type="text" 
                                                placeholder="--"
                                                className="w-full bg-[#0d1117] border border-slate-800 rounded p-1.5 text-center text-xs text-slate-200 outline-none focus:border-emerald-500"
                                                value={valoresPessoal[id].loteBact}
                                                onChange={(e) => handlePessoalChange(id, 'loteBact', e.target.value)}
                                            />
                                        </div>

                                        {/* Coluna Lote Fungo */}
                                        <div className="col-span-3">
                                            <input 
                                                type="text" 
                                                placeholder="--"
                                                className="w-full bg-[#0d1117] border border-slate-800 rounded p-1.5 text-center text-xs text-slate-200 outline-none focus:border-emerald-500"
                                                value={valoresPessoal[id].loteFung}
                                                onChange={(e) => handlePessoalChange(id, 'loteFung', e.target.value)}
                                            />
                                        </div>

                                        {/* Coluna Observações */}
                                        <div className="col-span-3 sm:col-span-2">
                                            <input 
                                                type="text" 
                                                placeholder="--"
                                                className="w-full bg-[#0d1117] border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
                                                value={valoresPessoal[id].obs}
                                                onChange={(e) => handlePessoalChange(id, 'obs', e.target.value)}
                                            />
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Botão de Envio de Dados */}
                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-lg hover:bg-emerald-500 active:scale-[0.99] transition-all disabled:opacity-50 text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
                    >
                        <span>💾</span> {enviando ? 'Processando Lote...' : 'Salvar Coleta'}
                    </button>

                </form>
            </div>
        </div>
    );
}
