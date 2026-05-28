// backend/src/models/Laudo.js
const mongoose = require('mongoose');

const LaudoSchema = new mongoose.Schema({

  tipoColeta: {
  type: String,
  required: true,
  enum: [
    'Sedimentação - Bactérias',
    'Sedimentação - Fungos',
    'Contato - Bactérias',
    'Contato - Fungos',
    'Toque de Luvas',
    'Mãos sem Luva',
    'Uniforme Estéril',
  ],
},

  status: {
    type: String,
    enum: ['Pendente Análise', 'Em Análise', 'Conforme', 'Inconforme'],
    default: 'Pendente Análise',
  },

  pontoId:         { type: String, default: null },
  loteOperacional: { type: String, default: '' },

  colaboradorId: { type: String, default: null },
  loteBact:      { type: String, default: '' },
  loteFung:      { type: String, default: '' },

  observacoesCampo: { type: String, default: '' },

  numeroLaudo:        { type: String, default: '' },
  ufcBacterias:       { type: Number, default: null },
  ufcFungos:          { type: Number, default: null },
  responsavelLeitura: { type: String, default: '' },
  dataAnalise:        { type: Date,   default: null },

}, { timestamps: true });

// Calcula dataPrazo automaticamente: 5 dias após dataColeta
LaudoSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('dataColeta')) {
    const prazo = new Date(this.dataColeta);
    prazo.setDate(prazo.getDate() + 5);
    this.dataPrazo = prazo;
  }
  next();
});

LaudoSchema.index({ status: 1 });
LaudoSchema.index({ dataPrazo: 1 });
LaudoSchema.index({ dataColeta: -1 });
LaudoSchema.index({ colaboradorId: 1 });
LaudoSchema.index({ pontoId: 1 });

module.exports = mongoose.model('Laudo', LaudoSchema);
