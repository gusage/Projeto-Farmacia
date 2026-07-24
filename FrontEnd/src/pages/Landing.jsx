// src/pages/Landing.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const FUNCIONALIDADES = [
  {
    icone: '🌡️',
    titulo: 'Monitoramento Ambiental',
    descricao: 'Registre e acompanhe coletas de todas as salas e bancadas com classificação por grau de criticidade.',
  },
  {
    icone: '📋',
    titulo: 'Gestão de Laudos',
    descricao: 'Controle o ciclo completo dos laudos — do registro à confirmação — com prazos automáticos e alertas.',
  },
  {
    icone: '🚨',
    titulo: 'Alertas de Prazo',
    descricao: 'Notificações automáticas para laudos vencidos, próximos do prazo e pendentes de análise.',
  },
  {
    icone: '📉',
    titulo: 'Análise de Tendências',
    descricao: 'Gráficos de evolução, ranking de pontos críticos e alertas automáticos de tendência negativa.',
  },
  {
    icone: '📎',
    titulo: 'Upload de Documentos',
    descricao: 'Anexe PDFs e imagens dos laudos laboratoriais diretamente em cada registro do sistema.',
  },
  {
    icone: '🔐',
    titulo: 'Controle de Acesso',
    descricao: 'Perfis diferenciados para farmacêuticos e técnicos, com histórico de responsáveis por operação.',
  },
];

const PASSOS = [
  {
    numero: '01',
    titulo: 'Registre a Coleta',
    descricao: 'Cadastre amostras ambientais e de pessoal com dados do turno, responsável e pontos de coleta de cada sala.',
  },
  {
    numero: '02',
    titulo: 'Acompanhe os Prazos',
    descricao: 'O sistema calcula automaticamente o prazo de entrega do laudo e emite alertas antes do vencimento.',
  },
  {
    numero: '03',
    titulo: 'Receba o Laudo',
    descricao: 'Registre o resultado do laboratório com UFC, número do laudo e anexe o documento em PDF.',
  },
  {
    numero: '04',
    titulo: 'Analise os Resultados',
    descricao: 'Consulte o histórico completo com filtros por sala, tipo, período e status de conformidade.',
  },
  {
    numero: '05',
    titulo: 'Monitore as Tendências',
    descricao: 'Acompanhe gráficos de evolução, rankings de pontos críticos e alertas automáticos de tendência negativa.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  const [form, setForm]         = useState({ nome: '', email: '', empresa: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado,  setEnviado]  = useState(false);
  const [erroForm, setErroForm] = useState('');

  const handleChange = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErroForm('');

    try {
      await api.post('/contato', form);
      setEnviado(true);
      setForm({ nome: '', email: '', empresa: '', mensagem: '' });
    } catch {
      setErroForm('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-emerald-950/50 border border-emerald-800 flex items-center justify-center text-emerald-400 font-black text-sm">
              🔬
            </div>
            <span className="text-sm font-black tracking-wider text-slate-200 uppercase">BioCount</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#funcionalidades" className="text-[11px] text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors hidden sm:block">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-[11px] text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors hidden sm:block">
              Como Funciona
            </a>
            <a href="#contato" className="text-[11px] text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors hidden sm:block">
              Contato
            </a>
            <button
              onClick={() => navigate('/login')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-4 py-2 rounded tracking-widest uppercase transition-all"
            >
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
              Sistema MES para Farmácias de Manipulação
            </span>
          </div>

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-100 leading-tight">
            Controle microbiológico
            <br />
            <span className="text-emerald-400">inteligente</span> para farmácias
            <br />
            de manipulação
          </h1>

          {/* Subtítulo */}
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Do registro da coleta à análise de tendências — tudo em um só lugar.
            Elimine planilhas, automatize prazos e mantenha sua farmácia em conformidade.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contato"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-8 py-3.5 rounded tracking-widest uppercase transition-all shadow-lg shadow-emerald-950/50"
            >
              Solicitar Demonstração
            </a>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-black text-sm px-8 py-3.5 rounded tracking-widest uppercase transition-all"
            >
              Já tenho acesso →
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-8 border-t border-slate-800">
            {[
              { valor: '100%', label: 'Rastreabilidade' },
              { valor: '5d',   label: 'Prazo automático' },
              { valor: '24/7', label: 'Alertas ativos'  },
            ].map(({ valor, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-emerald-400">{valor}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ────────────────────────────────────────────────── */}
      <section id="funcionalidades" className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-16">

          <div className="text-center space-y-3">
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Funcionalidades</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Tudo que sua farmácia precisa
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Desenvolvido para o fluxo real de farmácias de manipulação — do monitoramento ambiental ao controle de pessoal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FUNCIONALIDADES.map(({ icone, titulo, descricao }) => (
              <div
                key={titulo}
                className="bg-[#161b22] border border-slate-800 hover:border-emerald-900 p-6 rounded-lg space-y-4 transition-colors group"
              >
                <div className="h-10 w-10 rounded bg-emerald-950/50 border border-emerald-900/60 flex items-center justify-center text-xl group-hover:border-emerald-700 transition-colors">
                  {icone}
                </div>
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide">
                  {titulo}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ──────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-6 border-t border-slate-800 bg-[#161b22]/30">
        <div className="max-w-4xl mx-auto space-y-16">

          <div className="text-center space-y-3">
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Como Funciona</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Do registro à análise em 5 passos
            </h2>
          </div>

          <div className="space-y-4">
            {PASSOS.map(({ numero, titulo, descricao }, index) => (
              <div key={numero} className="flex gap-6 items-start group">

                {/* Número + linha conectora */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-10 w-10 rounded border border-emerald-800 bg-emerald-950/40 flex items-center justify-center text-emerald-400 text-[11px] font-black group-hover:border-emerald-600 transition-colors">
                    {numero}
                  </div>
                  {index < PASSOS.length - 1 && (
                    <div className="w-px h-8 bg-slate-800 mt-2" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="pb-6 space-y-1">
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide">
                    {titulo}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + FORMULÁRIO ───────────────────────────────────────────────── */}
      <section id="contato" className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-2xl mx-auto space-y-12">

          <div className="text-center space-y-3">
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Contato</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Pronto para começar?
            </h2>
            <p className="text-slate-400 text-sm">
              Preencha o formulário e entraremos em contato para agendar uma demonstração gratuita.
            </p>
          </div>

          {enviado ? (
            <div className="bg-emerald-950/40 border border-emerald-800 rounded-lg p-8 text-center space-y-3">
              <span className="text-4xl">✅</span>
              <p className="text-emerald-400 font-black uppercase tracking-wide text-sm">
                Mensagem enviada com sucesso!
              </p>
              <p className="text-slate-500 text-xs">
                Em breve entraremos em contato pelo e-mail informado.
              </p>
              <button
                onClick={() => setEnviado(false)}
                className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#161b22] border border-slate-800 rounded-lg p-6 space-y-4">

              {erroForm && (
                <div className="p-3 rounded text-xs font-bold border bg-rose-950/40 border-rose-800 text-rose-400">
                  ⚠️ {erroForm}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest">Nome</label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={e => handleChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                    disabled={enviando}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest">E-mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                    disabled={enviando}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest">Farmácia / Empresa</label>
                <input
                  type="text"
                  required
                  value={form.empresa}
                  onChange={e => handleChange('empresa', e.target.value)}
                  placeholder="Nome da sua farmácia"
                  className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                  disabled={enviando}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest">Mensagem</label>
                <textarea
                  required
                  rows={4}
                  value={form.mensagem}
                  onChange={e => handleChange('mensagem', e.target.value)}
                  placeholder="Conte um pouco sobre sua farmácia e o que você precisa..."
                  className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors resize-none"
                  disabled={enviando}
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs px-5 py-3 rounded tracking-widest uppercase transition-all shadow-md"
              >
                {enviando ? 'Enviando...' : 'Solicitar Demonstração'}
              </button>

            </form>
          )}

          {/* Link de login no rodapé */}
          <p className="text-center text-[11px] text-slate-600">
            Já possui acesso?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
            >
              Entrar no sistema →
            </button>
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center space-y-2">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">
          BioCount MES · Controle Microbiológico Inteligente
        </p>
        <p className="text-[9px] text-slate-700">
          Desenvolvido para farmácias de manipulação que levam conformidade a sério.
        </p>
      </footer>

    </div>
  );
}