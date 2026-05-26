// backend/server.js
require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('node:dns');

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const laudoRoutes = require('./routes/laudoRoute');
const checkRole = require('./middleware/roleMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Permite ler JSON no corpo das requisições
dns.setServers(['1.1.1.1', '8.8.8.8']); // Força o Node.js a usar os servidores de DNS da Claudeflare/Google

const connectDB = async () => {
    try {
        // process.env.MONGODB_URI puxa a string que configuramos no .env
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conexão com o MongoDB estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        process.exit(1); // Fecha o app se a conexão falhar
    }
};

// Inicializa a conexão com o banco
connectDB();

// Vinculando as rotas
app.use('/api/auth', authRoutes);
app.use('/api/laudos', laudoRoutes);

// Inicia o servidor Node.js
app.listen(PORT, () => {
    console.log('🚀 Servidor rodando na porta ${PORT}');
});
