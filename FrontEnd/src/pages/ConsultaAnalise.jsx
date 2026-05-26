// frontend/src/pages/ConsultaAnalise.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ConsultaAnalise() {
    // Estados de Dados
    const [laudos, setLaudos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    // Estados dos Filtros (Idênticos aos da imagem)
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [filtroMesAno, setFiltroMesAno] = useState('');
    const [filtroNumeroLaudo, setFiltroNumeroLaudo] = useState('');

    useEffect(() => {
        async function buscarHistorico() {
            try {
                // Buscamos todos os registros (independente de status)
                const response = await api.get('/laudos/consultar');
                setLaudos(response.data);
            } catch (error) {
                console.error("Erro ao carregar histórico:", error);
            } finally {
                setCarregando(false);
            }
        }
        buscarHistorico();
    }, []);

    // 1. Lógica Dinâmica dos Contadores (Métricas dos Cards)
    const totalRegistros = laudos.length;
    const totalRecebidos = laudos.filter(l => l.status === 'Conforme' || l.status === 'Inconforme').length;
    const totalPendentes = laudos.filter(l => l.status === 'Pendente Análise').length;

    // 2. Sistema de Filtros em Cascata no Frontend
    const laudosFiltrados = laudos.filter(laudo => {
        // Filtro por Tipo de Coleta
        if (filtroTipo !== 'Todos' && laudo.tipoColeta !== filtroTipo) return false;

        // Filtro por Status do Laudo
        if (filtroStatus !== 'Todos') {
            if (filtroStatus === 'Recebidos' && laudo.status === 'Pendente Análise') return false;
            if (filtroStatus === 'Pendentes' && laudo.status !== 'Pendente Análise') return false;
        }

        // Filtro por Mês/Ano (Tratando o input de data type="month")
        if (filtroMesAno) {
            const [ano, mes] = filtroMesAno.split('-');
            const dataDoc = new Date(laudo.dataColeta);
            const anoDoc = dataDoc.getFullYear().toString();
            const mesDoc = (dataDoc.getMonth() + 1).toString().padStart(2, '0');
            if (ano !== anoDoc || mes !== mesDoc) return false;
        }

        // Filtro por Número do Laudo
        if (filtroNumeroLaudo.trim() !== '') {
            if (!laudo.numeroLaudo || !laudo.numeroLaudo.toLowerCase().includes(filtroNumeroLaudo.toLowerCase())) {
                return false;
            }
        }

        return true;
    });

    // Helper para renderizar os Badges de Tipo de Coleta de forma compacta (Ex: Sedim. Bact.)
    const obterBadgeTipo = (tipo) => {
        switch (tipo) {
            case 'Sedimentação - Bactérias': return { texto: 'Sedim. Bact.', estilo: 'bg-blue-950 text-blue-400 border-blue-900/60' };
            case 'Sedimentação - Fungos': return { texto: 'Sedim. Fung.', estilo: 'bg-indigo-950 text-indigo-400 border-indigo-900/60' };
            case 'Contato - Bactérias': return { texto: 'Contat. Bact.', estilo: 'bg-cyan-950 text-cyan-400 border-cyan-900/60' };
            case 'Contato - Fungos': return { texto: 'Contat. Fung.', estilo: 'bg-teal-950 text-teal-400 border-teal-900/60' };
            case 'Toque de Luvas': return { texto: 'Luvas', estilo: 'bg-purple-950 text-purple-400 border-purple-900/60' };
            case 'Mãos sem Luva': return { texto: 'Mãos s/ Luv.', estilo: 'bg-amber-950 text-amber-400 border-amber-900/60' };
            case 'Uniforme Estéril': return { texto: 'Uniforme', estilo: 'bg-emerald-950 text-emerald-400 border-emerald-900/60' };
            default: return { texto: tipo, estilo: 'bg-slate-800 text-slate-400 border-slate-700' };
        }
    };

    // Helper para mapear o estilo do Grau de criticidade
    const obterEstiloGrau = (pontoId) => {
        if (!pontoId) return null;
        if (pontoId.includes('fluxo')) return { texto: 'Grau A', classe: 'bg-teal-950 text-teal-400 border-teal-800' };
        if (pontoId.includes('geral')) return { texto: 'Grau B', classe: 'bg-amber-950/60 text-amber-400 border-amber-900/60' };
        if (pontoId.includes('pulo')) return { texto: 'Grau C', classe: 'bg-orange-950 text-orange-400 border-orange-800' };
        if (pontoId.includes('lavacao')) return { texto: 'Grau D', classe: 'bg-purple-950 text-purple-400 border-purple-800' };
        return null;
    };

    // Helper para traduzir o identificador interno amigavelmente
    const obterNomePonto = (laudo) => {
        if (laudo.colaboradorId) return `${laudo.tipoColeta} | ${laudo.colaboradorId}`;
        
        const mapeamento = {
            'lavacao_pia': 'Bancada sala est. material limpo (PIA)',
            'lavacao_central': 'Bancada sala est. material limpo (BANCADA CENTRAL)',
            'geral_direito': 'Bancada de manipulação geral · Lado Direito',
            'geral_esquerdo': 'Bancada de manipulação geral · Lado Esquerdo',
            'fluxo_direito': 'Bancada fluxo laminar · Lado Direito',
            'fluxo_meio': 'Bancada fluxo laminar · Meio',
            'fluxo_esquerdo': 'Bancada fluxo laminar · Lado Esquerdo',
            'geral_pulo': 'Antecâmara entrada (BANCO DE PULO)'
        };
        return mapeamento[laudo.pontoId] || laudo.pontoId;
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono p-4 sm:p-6 pb-16">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="border-b border-slate-800 pb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
                        🔍 Consulta & Análise
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Histórico completo de coletas e resultados
                    </p>
                </div>

                {/* BLOCO DE FILTROS (Idêntico ao do mockup) */}
                <div className="border border-slate-800 bg-[#161b22] p-4 rounded-lg space-y-3">
                    <h2 className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Filtros</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Tipo de Coleta</label>
                            <select 
                                className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
                                value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <option value="Todos">Todos</option>
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
                            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Status do Laudo</label>
                            <select 
                                className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
                                value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
                            >
                                <option value="Todos">Todos</option>
                                <option value="Recebidos">Laudos Recebidos</option>
                                <option value="Pendentes">Pendentes</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Mês / Ano</label>
                            <input 
                                type="month" 
                                className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
                                value={filtroMesAno} onChange={(e) => setFiltroMesAno(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Nº do Laudo</label>
                            <input 
                                type="text" 
                                placeholder="Buscar por nº do laudo" 
                                className="w-full bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
                                value={filtroNumeroLaudo} onChange={(e) => setFiltroNumeroLaudo(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* CARDS INDICADORES (Métricas numéricas da foto) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center space-y-1">
                        <span className="text-xl">📋</span>
                        <p className="text-2xl font-black text-blue-400">{carregando ? '--' : totalRegistros}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Registros</p>
                    </div>

                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center space-y-1">
                        <span className="text-xl">✅</span>
                        <p className="text-2xl font-black text-emerald-400">{carregando ? '--' : totalRecebidos}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Laudos Recebidos</p>
                    </div>

                    <div className="bg-[#161b22] border border-slate-800 p-4 rounded-lg text-center space-y-1">
                        <span className="text-xl">⏳</span>
                        <p className="text-2xl font-black text-amber-500">{carregando ? '--' : totalPendentes}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pendentes</p>
                    </div>
                </div>

                {/* LISTAGEM DE HISTÓRICO COMPACTA */}
                <div className="space-y-2">
                    {carregando ? (
                        <div className="text-xs text-slate-500 animate-pulse text-center py-10">Sincronizando registros ativos...</div>
                    ) : laudosFiltrados.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs uppercase">
                            Nenhum registro encontrado para os filtros selecionados.
                        </div>
                    ) : (
                        laudosFiltrados.map((laudo) => {
                            const badge = obterBadgeTipo(laudo.tipoColeta);
                            const grau = obterEstiloGrau(laudo.pontoId);
                            const estaPendente = laudo.status === 'Pendente Análise';

                            return (
                                <div 
                                    key={laudo._id} 
                                    className={`bg-[#161b22]/40 border ${estaPendente ? 'border-amber-900/40 hover:border-amber-800/60' : 'border-emerald-950 hover:border-emerald-800'} p-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-colors`}
                                >
                                    {/* Esquerda: Identificação, Badges e Metadados */}
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Badge do Tipo de Coleta */}
                                            <span className={`${badge.estilo} border px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight`}>
                                                {badge.texto}
                                            </span>

                                            {/* Badge do Grau (Se houver) */}
                                            {grau && (
                                                <span className={`${grau.classe} border px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight`}>
                                                    {grau.texto}
                                                </span>
                                            )}

                                            {/* Informações Cronológicas e Operacionais */}
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(laudo.dataColeta).toLocaleDateString('pt-BR')} · {laudo.turno}
                                            </span>
                                        </div>

                                        {/* Nome Amigável do Local / Colaborador */}
                                        <h3 className="text-xs font-bold text-slate-200 tracking-wide">
                                            {obterNomePonto(laudo)}
                                        </h3>
                                    </div>

                                    {/* Direita: Status Real e Prazo Estimado */}
                                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto text-[10px] border-t md:border-none border-slate-800/40 pt-2 md:pt-0">
                                        
                                        {/* Status Badge */}
                                        {estaPendente ? (
                                            <span className="text-amber-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                                                ⏳ Pendente
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                                                ✅ Recebido
                                            </span>
                                        )}

                                        {/* Prazo */}
                                        <div className="text-right text-slate-500">
                                            Prazo: <span className="text-slate-400 font-medium">31/05/2026</span>
                                        </div>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}
