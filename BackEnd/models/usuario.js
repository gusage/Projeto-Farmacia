// backend/models/Usuario.js
const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Garante que não existam dois usuários com o mesmo e-mail
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'farmaceutica', 'tecnica'], // Restringe os cargos aceitos
        default: 'tecnica' // Se não for enviado, assume 'tecnica' por padrão
    }
}, { timestamps: true }); // Registra a data de criação do usuário

module.exports = mongoose.model('Usuario', UsuarioSchema);
