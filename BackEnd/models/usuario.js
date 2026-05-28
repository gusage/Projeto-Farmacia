// backend/src/models/Usuario.js
const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type:     String,
    required: true,
    trim:     true,
  },
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true,
  },
  senha: {
    type:     String,
    required: true,
  },
  role: {
    type:     String,
    required: true,
    enum:     ['admin', 'farmaceutica', 'tecnica'],
    default:  'tecnica',
  },
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);
