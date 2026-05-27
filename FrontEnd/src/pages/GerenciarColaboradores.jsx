// frontend/src/pages/Colaboradores.jsx
import { useState } from 'react';

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([
    "Colaborador 01", "Colaborador 02", "Colaborador 03", "Colaborador 04", "Colaborador 05",
    "Colaborador 06", "Colaborador 07", "Colaborador 08", "Colaborador 09", "Colaborador 10"
  ]);
  const [novoNome, setNovoNome] = useState("");

  const handleAdicionar = (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setColaboradores([...colaboradores, novoNome.trim()]);
    setNovoNome("");
  };

  const handleRemover = (indexParaRemover) => {
    setColaboradores(colaboradores.filter((_, index) => index !== indexParaRemover));
  };

  return (
    <div className="space-y-6">
      
      {/* TÍTULO DA SEÇÃO */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>👥</span> GERENCIAMENTO DE COLABORADORES
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">
          Cadastro de Analistas e Operadores Autorizados para Coleta de Amostras
        </p>
      </div>

      {/* FORMULÁRIO DE ADIÇÃO (Painel Superior) */}
      <div className="bg-[#161b22]/50 border border-slate-800 p-4 rounded-lg backdrop-blur-sm">
        <form onSubmit={handleAdicionar} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Nome do Novo Colaborador
            </label>
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Digite o nome completo do operador..."
              className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 rounded tracking-widest uppercase transition-all shadow-md shadow-emerald-950/40"
            >
              + Adicionar
            </button>
          </div>
        </form>
      </div>

      {/* LISTA DE COLABORADORES (Tabela Estilizada MES) */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#161b22]/20">
        {/* Cabeçalho Falso da Tabela */}
        <div className="bg-[#161b22] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Operador Autorizado</span>
          <span className="text-right">Ações</span>
        </div>

        {/* Corpo da Lista */}
        <div className="divide-y divide-slate-800/60">
          {colaboradores.map((nome, index) => (
            <div 
              key={index} 
              className="px-4 py-3 flex justify-between items-center hover:bg-[#161b22]/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-600 text-[11px] font-bold tracking-wider">#{String(index + 1).padStart(2, '0')}</span>
                <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">{nome}</span>
              </div>
              <button
                onClick={() => handleRemover(index)}
                className="bg-transparent hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 text-[10px] font-bold uppercase px-3 py-1.5 rounded transition-all"
              >
                Remover ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
