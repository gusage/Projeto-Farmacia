// backend/src/models/Laudo.js
const mongoose = require('mongoose');

const LaudoSchema = new mongoose.Schema({
    // Dados Gerais (Comum a ambos)
    tipoColeta: { type: String, required: true }, // Sedimentação, Toque de Luvas, Uniforme, etc.
    dataColeta: { type: Date, required: true },
    turno: { type: String, required: true },
    responsavelColeta: { type: String, required: true },
    status: { type: String, enum: ['Pendente Análise', 'Conforme', 'Inconforme'], default: 'Pendente Análise' },

    // Universo A: Monitoramento Ambiental (Salas/Pontos)
    pontoId: { type: String, default: null }, // ex: lavacao_pia, fluxo_direito
    loteOperacional: { type: String, default: '' }, // Lote único usado no ambiental
    
    // Universo B: Monitoramento de Pessoal (Colaboradores)
    colaboradorId: { type: String, default: null }, // ex: Colaborador 01, ou o nome digitado
    loteBact: { type: String, default: '' }, // Lote específico para Meio de Bactérias
    loteFung: { type: String, default: '' }, // Lote específico para Meio de Fungos
    
    // Observações Gerais de Campo
    observacoesCampo: { type: String, default: '' },

    // Dados de Liberação (Farmacêutica)
    numeroLaudo: { type: String, default: '' },
    ufcBactérias: { type: Number, default: null },
    ufcFungos: { type: Number, default: null },
    responsavelLeitura: { type: String, default: '' },
    dataAnalise: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Laudo', LaudoSchema);
