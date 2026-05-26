// frontend/src/pages/ColetaForm.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ColetaForm() {
    const tiposColeta = [
        'Sedimentação - Bactérias',
        'Sedimentação - Fungos',
        'Contato - Bactérias',
        'Contato - Fungos',
        'Toque de Luva',
        'Mãos sem luva',
        'Uniforme estéril'
    ];

    const dadosSalas = {
        'Lavação': [
            'Bancada sala est. material limpo (PIA)',
            'Bancada sala est. material limpo (BANCADA CENTRAL)'
        ],
        'Geral': [
            'Bancada de manipulação geral - Lado Direito',
            'Bancada de manipulação geral - Lado Esquerdo',
            'Bancada fluxo laminar - Lado Direito',
            'Bancada fluxo laminar - Meio',
            'Bancada fluxo laminar - Lado Esquerdo',
            'Antecâmara entrada (BANCO DE PULO)'
        ],
        'Antibióticos': [
            'Bancada de manipulação Antibióticos - Lado Direito',
            'Bancada de manipulação Antibióticos - Lado Esquerdo',
            'Bancada fluxo laminar Antibióticos - Lado Direito (Frente)',
            'Bancada fluxo laminar Antibióticos - Lado Esquerdo (Atrás)',
            'Antecâmara entrada Antibióticos (BANCO DE PULO)'
        ],
        'Hormônios': [
            'Bancada de manipulação hormônios - Lado Direito',
            'Bancada de manipulação hormônios - Lado Esquerdo',
            'Bancada fluxo laminar hormônios - Lado Direito',
            'Bancada fluxo laminar hormônios - Lado Esquerdo',
            'Antecâmara entrada hormônios (BANCO DE PULO)'
        ]
    };

    // Estados do Formulário
    const [abaAtiva, setAbaAtiva] = useState('Sedimentação - Bactérias');
    const [salaSelecionada, setSalaSelecionada] = useState('');
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [funcionario, setFuncionario] = useState('');
    const [lote, setLote] = useState('');
    const [ufcEncontrado, setUfcEncontrado] = useState(0);
    const [observacoes, setObservacoes] = useState('');
    const [farmaceuticaResponsavel, setFarmaceuticaResponsavel] = useState(''); // Novo Estado: Farmacêutica Responsável pela Análise posterior
    
    // Lista simulada de farmacêuticas cadastradas no sistema (depois puxaremos do banco)
    const listaFarmaceuticas = [
        { id: 'farm1', nome: 'Dra. Amanda Silva' },
        { id: 'farm2', nome: 'Dra. Carolina Souza' }
    ];

    const [dataHoraAtual, setDataHoraAtual] = useState(new Date());
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setDataHoraAtual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleMudarAba = (tipo) => {
        setAbaAtiva(tipo);
        setSalaSelecionada('');
        setAreaSelecionada('');
        setFuncionario('');
        setLote('');
        setUfcEncontrado(0);
        setObservacoes('');
        setFarmaceuticaResponsavel('');
        setMensagem({ tipo: '', texto: '' });
    };

    const ehColetaAmbiental = abaAtiva.includes('Sedimentação') || abaAtiva.includes('Contato');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensagem({ tipo: '', texto: '' });

        // MODIFICADO: O status agora vai fixo como 'Pendente' para a validação da farmacêutica
        const payload = {
            tipoColeta: abaAtiva,
            dataHoraRegistro: dataHoraAtual,
            ufcEncontrado: Number(ufcEncontrado),
            status: 'Pendente Análise', 
            farmaceuticaResponsavel, 
            observacoes,
            ...(ehColetaAmbiental 
                ? { sala: salaSelecionada, area: areaSelecionada } 
                : { funcionarioVistoriado: funcionario, lote }
            )
        };

        try {
            await api.post('/laudos/registrar', payload);
            setMensagem({ tipo: 'sucesso', texto: `✅ Coleta enviada para a fila de análise da farmacêutica!` });
            setUfcEncontrado(0);
            setLote('');
            setObservacoes('');
        } catch {
            setMensagem({ tipo: 'erro', texto: '❌ Falha ao enviar registro para o servidor.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-12">
            <div className="bg-slate-900 text-white p-6 shadow-md border-b-4 border-emerald-500">
                <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-emerald-400">
                            Coleta de Dados
                        </h1>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-right w-full sm:w-auto">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-500">Data da Coleta </span>
                        <span className="font-mono text-sm font-bold text-slate-200">
                            {dataHoraAtual.toLocaleDateString('pt-BR')} — {dataHoraAtual.toLocaleTimeString('pt-BR')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-6 px-4">
                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none snap-x">
                    {tiposColeta.map((tipo) => (
                        <button
                            key={tipo}
                            type="button"
                            onClick={() => handleMudarAba(tipo)}
                            className={`px-4 py-2.5 text-xs font-bold rounded-lg whitespace-nowrap border snap-center transition-all ${
                                abaAtiva === tipo ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 border border-slate-200 space-y-6">
                    <div className="border-b border-slate-100 pb-2">
                        <h2 className="text-lg font-bold text-slate-800">{abaAtiva}</h2>
                        <p className="text-xs text-slate-500">Insira os dados brutos obtidos em campo.</p>
                    </div>

                    {mensagem.texto && (
                        <div className={`p-4 rounded-lg text-sm font-semibold border ${
                            mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                            {mensagem.texto}
                        </div>
                    )}

                    {ehColetaAmbiental ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Sala Monitorada </label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={salaSelecionada}
                                    onChange={(e) => { setSalaSelecionada(e.target.value); setAreaSelecionada(''); }}
                                    required
                                >
                                    <option value="">Selecione a sala...</option>
                                    {Object.keys(dadosSalas).map(sala => <option key={sala} value={sala}>{sala}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Área / Ponto de Coleta </label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                                    value={areaSelecionada}
                                    onChange={(e) => setAreaSelecionada(e.target.value)}
                                    disabled={!salaSelecionada}
                                    required
                                >
                                    <option value="">Selecione o ponto exato...</option>
                                    {salaSelecionada && dadosSalas[salaSelecionada].map(area => <option key={area} value={area}>{area}</option>)}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Funcionário Vistoriado </label>
                                <input
                                    type="text"
                                    placeholder="Nome completo do colaborador"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={funcionario}
                                    onChange={(e) => setFuncionario(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Lote Operacional </label>
                                <input
                                    type="text"
                                    placeholder="Ex: LOT-2026X"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={lote}
                                    onChange={(e) => setLote(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Seção Quantitativa e Direcionamento do Fluxo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Contagem Bruta (UFC) </label>
                            <input
                                type="number"
                                min="0"
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={ufcEncontrado}
                                onChange={(e) => setUfcEncontrado(e.target.value)}
                                required
                            />
                        </div>

                        {/* NOVO CAMPO: Direcionamento para a validação da Farmacêutica */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Farmacêutica de Plantão </label>
                            <select
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={farmaceuticaResponsavel}
                                onChange={(e) => setFarmaceuticaResponsavel(e.target.value)}
                                required
                            >
                                <option value="">Defina a avaliadora...</option>
                                {listaFarmaceuticas.map(f => (
                                    <option key={f.id} value={f.nome}>{f.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Notas de Campo </label>
                        <textarea
                            rows="2"
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                            placeholder="Informações adicionais da coleta"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-50 text-sm tracking-wide uppercase"
                    >
                        {enviando ? 'Sincronizando com MongoDB Atlas...' : 'Encaminhar para Avaliação Farmacêutica'}
                    </button>
                </form>
            </div>
        </div>
    );
}