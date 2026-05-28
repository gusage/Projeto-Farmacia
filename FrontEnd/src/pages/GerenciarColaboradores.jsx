// src/pages/GerenciarColaboradores.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function GerenciarColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [novoNome,      setNovoNome]      = useState('');
  const [carregando,    setCarregando]    = useState(true);
  const [salvando,      setSalvando]      = useState(false);
  const [mensagem,      setMensagem]      = useState({ tipo: '', texto: '' });

  // Carrega do backend ao montar
  useEffect(() => {
    async function buscar() {
      try {
        const response = await api.get('/colaboradores');
        setColaboradores(response.data);
      } catch {
        setMensagem({ tipo: 'erro', texto: 'Erro ao carregar colaboradores.' });
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, []);

  const flash = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
  };

  const handleAdicionar = async (e) => {
    e.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;

    setSalvando(true);
    try {
      const response = await api.post('/colaboradores', { nome });
      setColaboradores(prev => [...prev, response.data]);
      setNovoNome('');
      flash('sucesso', `✅ ${nome} adicionado com sucesso.`);
    } catch {
      flash('erro', '❌ Erro ao adicionar colaborador.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id, nome) => {
    if (!window.confirm(`Remover "${nome}" do sistema?`)) return;

    try {
      await api.delete(`/colaboradores/${id}`);
      setColaboradores(prev => prev.filter(c => c._id !== id));
      flash('sucesso', `✅ ${nome} removido.`);
    } catch {
      flash('erro', '❌ Erro ao remover colaborador.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>👥</span> GERENCIAMENTO DE COLABORADORES
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">
          Cadastro de Analistas e Operadores Autorizados para Coleta de Amostras
        </p>
      </div>

      {/* Flash */}
      {mensagem.texto && (
        <div className={`p-3 rounded text-xs font-bold border ${
          mensagem.tipo === 'sucesso'
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
            : 'bg-rose-950/40 text-rose-400 border-rose-800'
        }`}>
          {mensagem.texto}
        </div>
      )}

      {/* Formulário */}
      <div className="bg-[#161b22]/50 border border-slate-800 p-4 rounded-lg">
        <form onSubmit={handleAdicionar} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Nome do Novo Colaborador
            </label>
            <input
              type="text"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              placeholder="Digite o nome completo do operador..."
              className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono transition-colors"
              disabled={salvando}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={salvando || !novoNome.trim()}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs px-6 py-2.5 rounded tracking-widest uppercase transition-all shadow-md shadow-emerald-950/40"
            >
              {salvando ? 'Salvando...' : '+ Adicionar'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#161b22]/20">
        <div className="bg-[#161b22] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Operador Autorizado</span>
          <span>{carregando ? '...' : `${colaboradores.length} registros`}</span>
        </div>

        {carregando && (
          <div className="px-4 py-8 text-center text-xs text-slate-600 animate-pulse uppercase tracking-widest">
            Carregando operadores...
          </div>
        )}

        {!carregando && colaboradores.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-slate-600 uppercase tracking-widest">
            Nenhum colaborador cadastrado.
          </div>
        )}

        {!carregando && (
          <div className="divide-y divide-slate-800/60">
            {colaboradores.map((colab, index) => (
              <div
                key={colab._id} // _id do MongoDB — estável, sem bug ao remover
                className="px-4 py-3 flex justify-between items-center hover:bg-[#161b22]/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 text-[11px] font-bold tracking-wider">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">
                    {colab.nome}
                  </span>
                </div>
                <button
                  onClick={() => handleRemover(colab._id, colab.nome)}
                  className="bg-transparent hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 text-[10px] font-bold uppercase px-3 py-1.5 rounded transition-all"
                >
                  Remover ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
