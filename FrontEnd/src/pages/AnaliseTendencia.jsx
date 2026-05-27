// frontend/src/pages/AnaliseTendencia.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AnaliseTendencia() {
    const [laudos, setLaudos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('Todos os tipos');

    useEffect(() => {
        async function buscarDados() {
            try {
                const response = await api.get('/laudos/consultar');
                // Garante que a resposta seja um array válido
                if (Array.isArray(response.data)) {
                    setLaudos(response.data);
                }
            } catch (error) {
                console.error("Erro ao carregar dados de tendência:", error);
            } finally {
                setCarregando(false);
            }
        }
        buscarDados();
    }, []);

    // 1. Filtragem dinâmica com tratamento preventivo para valores nulos/indefinidos
    const laudosFiltrados = laudos.filter(l => {
        if (!l || !l.tipoColeta) return false;
        if (filtroTipo === 'Todos os tipos') return true;
        return l.tipoColeta === filtroTipo;
    });

    // 2. Cálculos para o Bloco "Resumo Geral"
    const totalRegistrosGeral = laudosFiltrados.length;
    const aprovadosGeral = laudosFiltrados.filter(l => l.status === 'Conforme').length;
    const reprovadosGeral = laudosFiltrados.filter(l => l.status === 'Inconforme').length;
    const recoletaGeral = laudosFiltrados.filter(l => l.precisaRecoleta === true || l.status === 'Recoleta').length;

    // 3. Cálculos específicos para o bloco inferior (Protegido contra erros de string)
    const laudosSedimentacao = laudosFiltrados.filter(l => l.tipoColeta && l.tipoColeta.toLowerCase().includes('sedimentação'));
    const totalSedimentacao = laudosSedimentacao.length;
    const aprovadosSedimentacao = laudosSedimentacao.filter(l => l.status === 'Conforme').length;
    const reprovadosSedimentacao = laudosSedimentacao.filter(l => l.status === 'Inconforme').length;

    return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono p-4 sm:p-6 pb-16">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Título e Subtítulo da Página */}
                <div>
                    <h1 className="text-base font-bold text-slate-200 tracking-wide flex items-center gap-2">
                        📉 Análise de Tendência
                    </h1>
                    <p className="text-[10px] text-slate-500 tracking-wide">
                        Visão detalhada dos resultados com filtros e resumo visual
                    </p>
                </div>

                {/* FILTRO POR TIPO */}
                <div className="border border-slate-800 bg-[#161b22]/50 p-4 rounded-lg">
                    <label className="block text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">
                        Filtro por Tipo
                    </label>
                    <select 
                        className="w-full sm:w-80 bg-[#0d1117] border border-slate-700 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option>Todos os tipos</option>
                        <option>Sedimentação - Bactérias</option>
                        <option>Sedimentação - Fungos</option>
                        <option>Contato - Bactérias</option>
                        <option>Contato - Fungos</option>
                        <option>Toque de Luvas</option>
                        <option>Mãos sem Luva</option>
                        <option>Uniforme Estéril</option>
                    </select>
                </div>

                {/* SEÇÃO: RESUMO GERAL */}
                <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <h2 className="font-bold text-slate-200">
                            Resumo Geral — <span className="text-slate-400">{carregando ? 'Carregando...' : `${totalRegistrosGeral} registros`}</span>
                        </h2>
                        <span className="text-[9px] text-slate-500">Última atualização: 27/05/2026</span>
                    </div>

                    {/* Grid de 3 Colunas Grandes (Aprovados, Reprovados, Recoleta) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Aprovados */}
                        <div className="bg-emerald-950/30 border border-emerald-900/40 p-4 rounded text-center space-y-1">
                            <p className="text-3xl font-black text-emerald-500">{carregando ? '0' : aprovadosGeral}</p>
                            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider">Aprovados</p>
                        </div>

                        {/* Reprovados */}
                        <div className="bg-rose-950/20 border border-rose-950 p-4 rounded text-center space-y-1">
                            <p className="text-3xl font-black text-rose-500">{carregando ? '0' : reprovadosGeral}</p>
                            <p className="text-[9px] text-rose-700 font-black uppercase tracking-wider">Reprovados</p>
                        </div>

                        {/* Recoleta */}
                        <div className="bg-[#161b22] border border-slate-800 p-4 rounded text-center space-y-1">
                            <p className="text-3xl font-black text-amber-500">{carregando ? '0' : recoletaGeral}</p>
                            <p className="text-[9px] text-amber-600 font-black uppercase tracking-wider">Recoleta</p>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO INFERIOR DETALHADA: SEDIMENTAÇÃO BACTÉRIAS */}
                <div className="border border-slate-800 bg-[#161b22]/30 p-5 rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-950 text-blue-400 border border-blue-900/60 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                            Sedim. Bact.
                        </span>
                        <h3 className="text-xs font-bold text-slate-200">
                            {carregando ? '0' : totalSedimentacao} registros
                        </h3>
                    </div>

                    {/* Divisão Horizontal em Duas Grandes Barras Coloridas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Barra de Aprovados */}
                        <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded flex justify-between items-center">
                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Aprovados</span>
                            <span className="text-base font-black text-emerald-500">{carregando ? '0' : aprovadosSedimentacao}</span>
                        </div>

                        {/* Barra de Reprovados */}
                        <div className="bg-rose-950/10 border border-rose-950 p-3 rounded flex justify-between items-center">
                            <span className="text-[10px] text-rose-700 font-bold uppercase">Reprovados</span>
                            <span className="text-base font-black text-rose-500">{carregando ? '0' : reprovadosSedimentacao}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}