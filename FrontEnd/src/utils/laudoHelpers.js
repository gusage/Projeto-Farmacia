// src/utils/laudoHelpers.js

// ── TIPOS DE COLETA ────────────────────────────────────────────────────────────
export const TIPOS_COLETA = [
  'Sedimentação - Bactérias',
  'Sedimentação - Fungos',
  'Contato - Bactérias',
  'Contato - Fungos',
  'Toque de Luvas',
  'Mãos sem Luva',
  'Uniforme Estéril',
];

export const TIPOS_PESSOAL = ['Toque de Luvas', 'Mãos sem Luva', 'Uniforme Estéril'];

// ── BADGES DE TIPO ─────────────────────────────────────────────────────────────
export const BADGE_TIPO = {
  'Sedimentação - Bactérias': { texto: 'Sedim. Bact.',  estilo: 'bg-blue-950 text-blue-400 border-blue-900/60'          },
  'Sedimentação - Fungos':    { texto: 'Sedim. Fung.',  estilo: 'bg-indigo-950 text-indigo-400 border-indigo-900/60'    },
  'Contato - Bactérias':      { texto: 'Contat. Bact.', estilo: 'bg-cyan-950 text-cyan-400 border-cyan-900/60'          },
  'Contato - Fungos':         { texto: 'Contat. Fung.', estilo: 'bg-teal-950 text-teal-400 border-teal-900/60'          },
  'Toque de Luvas':           { texto: 'Luvas',         estilo: 'bg-purple-950 text-purple-400 border-purple-900/60'    },
  'Mãos sem Luva':            { texto: 'Mãos s/ Luv.',  estilo: 'bg-amber-950 text-amber-400 border-amber-900/60'       },
  'Uniforme Estéril':         { texto: 'Uniforme',      estilo: 'bg-emerald-950 text-emerald-400 border-emerald-900/60' },
};

// ── GRAU POR PONTO ─────────────────────────────────────────────────────────────
export const GRAU_PONTO = {
  fluxo:   { texto: 'Grau A', classe: 'bg-teal-950 text-teal-400 border-teal-800'           },
  geral:   { texto: 'Grau B', classe: 'bg-amber-950/60 text-amber-400 border-amber-900/60'  },
  pulo:    { texto: 'Grau C', classe: 'bg-orange-950 text-orange-400 border-orange-800'     },
  lavacao: { texto: 'Grau D', classe: 'bg-purple-950 text-purple-400 border-purple-800'     },
};

// ── NOME AMIGÁVEL DOS PONTOS ───────────────────────────────────────────────────
export const NOME_PONTO = {
  // Sala 1 - Geral
  lavacao_pia:     'Bancada sala est. material limpo (PIA)',
  lavacao_central: 'Bancada sala est. material limpo (BANCADA CENTRAL)',
  geral_direito:   'Bancada de manipulação geral · Lado Direito',
  geral_esquerdo:  'Bancada de manipulação geral · Lado Esquerdo',
  fluxo_direito:   'Bancada fluxo laminar · Lado Direito',
  fluxo_meio:      'Bancada fluxo laminar · Meio',
  fluxo_esquerdo:  'Bancada fluxo laminar · Lado Esquerdo',
  geral_pulo:      'Antecâmara entrada (BANCO DE PULO)',
  //Sala 2 - Antibióticos
  antibio_bancada_direito:  'Bancada de manipulação antibióticos · Lado Direito',
  antibio_bancada_esquerdo: 'Bancada de manipulação antibióticos · Lado Esquerdo',
  antibio_fluxo_direito:    'Bancada fluxo laminar antibióticos · Lado Direito (Frente)',
  antibio_fluxo_esquerdo:   'Bancada fluxo laminar antibióticos · Lado Esquerdo (Atrás)',
  antibio_pulo:             'Antecâmara entrada antibióticos (BANCO DE PULO)',
  // Sala 3 - Hormônios
   hormonio_bancada_direito:  'Bancada manipulação hormônios · Lado Direito',
  hormonio_bancada_esquerdo: 'Bancada manipulação hormônios · Lado Esquerdo',
  hormonio_fluxo_direito:    'Bancada fluxo laminar hormônios · Lado Direito',
  hormonio_fluxo_esquerdo:   'Bancada fluxo laminar hormônios · Lado Esquerdo',
  hormonio_pulo:             'Antecâmara entrada hormônios (BANCO DE PULO)',
};

// ── PONTOS AMBIENTAIS COMPLETOS (usado no ColetaForm) ─────────────────────────
export const PONTOS_AMBIENTAIS = [
  {
    grupo: 'Lavação',
    cor: 'border-purple-500 text-purple-400',
    pontos: [
      { id: 'lavacao_pia',     grau: 'Grau D', titulo: 'Bancada sala est. material limpo (PIA)',            limite: '< 50 UFC/PL', badge: 'bg-purple-950 text-purple-400 border-purple-800' },
      { id: 'lavacao_central', grau: 'Grau D', titulo: 'Bancada sala est. material limpo (BANCADA CENTRAL)', limite: '< 50 UFC/PL', badge: 'bg-purple-950 text-purple-400 border-purple-800' },
    ],
  },
  {
    grupo: 'Sala 1 — Geral',
    cor: 'border-amber-500 text-amber-500',
    pontos: [
      { id: 'geral_direito',  grau: 'Grau B', titulo: 'Bancada de manipulação geral · Lado Direito',  limite: '< 25 UFC/PL',       badge: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
      { id: 'geral_esquerdo', grau: 'Grau B', titulo: 'Bancada de manipulação geral · Lado Esquerdo', limite: '< 25 UFC/PL',       badge: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
      { id: 'fluxo_direito',  grau: 'Grau A', titulo: 'Bancada fluxo laminar · Lado Direito',         limite: '0 UFC/PL (Grau A)', badge: 'bg-teal-950 text-teal-400 border-teal-800'           },
      { id: 'fluxo_meio',     grau: 'Grau A', titulo: 'Bancada fluxo laminar · Meio',                 limite: '0 UFC/PL (Grau A)', badge: 'bg-teal-950 text-teal-400 border-teal-800'           },
      { id: 'fluxo_esquerdo', grau: 'Grau A', titulo: 'Bancada fluxo laminar · Lado Esquerdo',        limite: '0 UFC/PL (Grau A)', badge: 'bg-teal-950 text-teal-400 border-teal-800'           },
      { id: 'geral_pulo',     grau: 'Grau C', titulo: 'Antecâmara entrada (BANCO DE PULO)',            limite: '< 25 UFC/PL',       badge: 'bg-orange-950 text-orange-400 border-orange-800'    },
    ],
  },
  {
    grupo: 'Sala 2 — Antibióticos',
    cor: 'border-rose-500 text-rose-400',
    pontos: [
      { id: 'antibio_bancada_direito',  grau: 'Grau B', titulo: 'Bancada de manipulação antibióticos · Lado Direito',       limite: '< 25 UFC/PL',       badge: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
      { id: 'antibio_bancada_esquerdo', grau: 'Grau B', titulo: 'Bancada de manipulação antibióticos · Lado Esquerdo',      limite: '< 25 UFC/PL',       badge: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
      { id: 'antibio_fluxo_direito',    grau: 'Grau A', titulo: 'Bancada fluxo laminar antibióticos · Lado Direito (Frente)', limite: '0 UFC/PL (Grau A)', badge: 'bg-teal-950 text-teal-400 border-teal-800'           },
      { id: 'antibio_fluxo_esquerdo',   grau: 'Grau A', titulo: 'Bancada fluxo laminar antibióticos · Lado Esquerdo (Atrás)', limite: '0 UFC/PL (Grau A)', badge: 'bg-teal-950 text-teal-400 border-teal-800'           },
      { id: 'antibio_pulo',             grau: 'Grau C', titulo: 'Antecâmara entrada antibióticos (BANCO DE PULO)',           limite: '< 25 UFC/PL',       badge: 'bg-orange-950 text-orange-400 border-orange-800'    },
    ],
  },
  {
    grupo: 'Sala 3 — Hormônios',
    cor: 'border-violet-500 text-violet-400',
    pontos: [
      { id: 'hormonio_bancada_direito',  grau: 'Grau B', titulo: 'Bancada manipulação hormônios · Lado Direito',  limite: '< 25 UFC/PL',       badge: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
      { id: 'hormonio_bancada_esquerdo', grau: 'Grau B', titulo: 'Bancada manipulação hormônios · Lado Esquerdo', limite: '< 25 UFC/PL',       badge: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
      { id: 'hormonio_fluxo_direito',    grau: 'Grau A', titulo: 'Bancada fluxo laminar hormônios · Lado Direito', limite: '0 UFC/PL (Grau A)', badge: 'bg-teal-950 text-teal-400 border-teal-800'           },
      { id: 'hormonio_fluxo_esquerdo',   grau: 'Grau A', titulo: 'Bancada fluxo laminar hormônios · Lado Esquerdo', limite: '0 UFC/PL (Grau A)', badge: 'bg-teal-950 text-teal-400 border-teal-800'           },
      { id: 'hormonio_pulo',             grau: 'Grau C', titulo: 'Antecâmara entrada hormônios (BANCO DE PULO)',   limite: '< 25 UFC/PL',       badge: 'bg-orange-950 text-orange-400 border-orange-800'    },
    ],
  },
];

// ── FUNÇÕES HELPER ─────────────────────────────────────────────────────────────
export function obterBadgeTipo(tipo) {
  return BADGE_TIPO[tipo] || { texto: tipo, estilo: 'bg-slate-800 text-slate-400 border-slate-700' };
}

export function obterGrau(pontoId) {
  if (!pontoId) return null;
  const chave = Object.keys(GRAU_PONTO).find(k => pontoId.includes(k));
  return chave ? GRAU_PONTO[chave] : null;
}

export function obterNomePonto(laudo) {
  if (laudo.colaboradorId) return `${laudo.tipoColeta} | ${laudo.colaboradorId}`;
  return NOME_PONTO[laudo.pontoId] || laudo.pontoId || '—';
}

export function calcularDiasRestantes(dataPrazo) {
  if (!dataPrazo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = new Date(dataPrazo);
  prazo.setHours(0, 0, 0, 0);
  return Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
}

export function calcularPrazo(dataStr) {
  if (!dataStr) return '—';
  const d = new Date(dataStr);
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('pt-BR');
}
