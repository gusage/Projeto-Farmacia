// backend/src/models/Laudo.js
const mongoose = require('mongoose');

const LaudoSchema = new mongoose.Schema({

  // ── DADOS GERAIS ──────────────────────────────────────────
  tipoColeta: {
    type: String,
    required: true,
    enum: ['Sedimentação', 'Toque de Luvas', 'Uniforme', 'Ambiental', 'Pessoal'],
  },
  dataColeta:          { type: Date,   required: true },
  dataPrazo:           { type: Date,   required: true }, // 🆕 necessário pro painel de alertas
  turno:               { type: String, required: true },
  responsavelColeta:   { type: String, required: true },

  status: {
    type: String,
    enum: ['Pendente Análise', 'Em Análise', 'Conforme', 'Inconforme'],
    default: 'Pendente Análise',
  },

  // ── UNIVERSO A: AMBIENTAL (Salas/Pontos) ──────────────────
  pontoId:          { type: String, default: null },
  loteOperacional:  { type: String, default: '' },

  // ── UNIVERSO B: PESSOAL (Colaboradores) ───────────────────
  colaboradorId:  { type: String, default: null },
  loteBact:       { type: String, default: '' },
  loteFung:       { type: String, default: '' },

  // ── CAMPO ─────────────────────────────────────────────────
  observacoesCampo: { type: String, default: '' },

  // ── LIBERAÇÃO (Farmacêutica) ───────────────────────────────
  numeroLaudo:          { type: String,  default: '' },
  ufcBacterias:         { type: Number,  default: null }, // 🔧 removido acento — evita bug em queries
  ufcFungos:            { type: Number,  default: null },
  responsavelLeitura:   { type: String,  default: '' },
  dataAnalise:          { type: Date,    default: null },

}, { timestamps: true });

// ── ÍNDICES para queries frequentes ───────────────────────────
LaudoSchema.index({ status: 1 });
LaudoSchema.index({ dataPrazo: 1 });
LaudoSchema.index({ dataColeta: -1 });
LaudoSchema.index({ colaboradorId: 1 });
LaudoSchema.index({ pontoId: 1 });

module.exports = mongoose.model('Laudo', LaudoSchema);
