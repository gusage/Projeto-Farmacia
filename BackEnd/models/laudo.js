// backend/models/Laudo.js
const mongoose = require('mongoose');

const LaudoSchema = new mongoose.Schema({
    // Vincula a coleta diretamente ao usuário do sistema que a realizou
    responsavel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    dataColeta: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Ex: Sala de Sólidos, Sala de Pesagem, Controle de Qualidade
    ambiente: {
        type: String,
        required: true
    },
    // Ex: Ar (Placa de sedimentação), Superfície (Swab), Mãos do operador
    tipoAmostragem: {
        type: String,
        required: true
    },
    // Resultado quantitativo para gerar os gráficos de tendência
    ufcEncontrado: {
        type: Number, // Unidades Formadoras de Colônia
        required: true,
        default: 0
    },
    // Microorganismo identificado (se houver)
    microorganismo: {
        type: String,
        default: 'Nenhum detectado'
    },
    // Conclusão do laudo
    status: {
        type: String,
        enum: ['Conforme', 'Alerta', 'Inconforme'],
        required: true
    },
    observacoes: String
}, { timestamps: true }); // Cria campos 'createdAt' e 'updatedAt' automaticamente

module.exports = mongoose.model('Laudo', LaudoSchema);
