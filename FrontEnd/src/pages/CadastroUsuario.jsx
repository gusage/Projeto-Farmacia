// src/pages/CadastroUsuario.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CadastroUsuario() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nome:  '',
    email: '',
    senha: '',
    role:  'tecnica',
  });
  const [mensagem,  setMensagem]  = useState({ tipo: '', texto: '' });
  const [salvando,  setSalvando]  = useState(false);

  const handleChange = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await api.post('/auth/registrar', form);
      setMensagem({ tipo: 'sucesso', texto: `✅ Usuário ${form.nome} cadastrado com sucesso!` });
      setForm({ nome: '', email: '', senha: '', role: 'tecnica' });
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.response?.data?.message || '❌ Erro ao cadastrar usuário.',
      });
    } finally {
      setSalvando(false);
    }
  };

  // Bloqueia acesso se não for farmacêutica
  if (user?.role !== 'farmaceutica') {
    return (
      <div className="py-20 text-center text-rose-400 text-xs uppercase tracking-widest font-bold">
        ⛔ Acesso restrito a farmacêuticos.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide text-slate-200">
          👤 Cadastro de Usuário
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
          Cadastro de farmacêuticos e técnicos autorizados no sistema
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
      <div className="border border-slate-800 bg-[#161b22] p-6 rounded-lg max-w-lg">
        <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">
          Dados do Novo Usuário
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={e => handleChange('nome', e.target.value)}
              placeholder="Ex: Dra. Ana Paula"
              className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono transition-colors"
              disabled={salvando}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              E-mail Institucional
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="usuario@atlaspharma.com"
              className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono transition-colors"
              disabled={salvando}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Senha de Acesso
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.senha}
              onChange={e => handleChange('senha', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono transition-colors"
              disabled={salvando}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Cargo
            </label>
            <select
              value={form.role}
              onChange={e => handleChange('role', e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
              disabled={salvando}
            >
              <option value="tecnica">Técnica</option>
              <option value="farmaceutica">Farmacêutica</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={salvando || !form.nome || !form.email || !form.senha}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs px-5 py-2.5 rounded tracking-widest uppercase transition-all shadow-md"
            >
              {salvando ? 'Cadastrando...' : '+ Cadastrar Usuário'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
