// backend/src/models/Colaborador.js
const mongoose = require('mongoose');

const ColaboradorSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
}, { timestamps: true });

ColaboradorSchema.index({ nome: 1 });

module.exports = mongoose.model('Colaborador', ColaboradorSchema);
