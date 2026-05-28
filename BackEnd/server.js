// backend/src/server.js
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const dns        = require('node:dns');

const authRoutes         = require('./routes/auth');
const laudoRoutes        = require('./routes/laudoRoute');
const colaboradorRoutes  = require('./routes/colaboradorRoute');

const app  = express();
const PORT = process.env.PORT || 3000;

// DNS — mantém sua solução, funciona bem no Render
dns.setServers(['1.1.1.1', '8.8.8.8']);

// CORS — restringe origem em produção
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));

app.use(express.json());

// Conexão MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

// Rotas
app.use('/api/auth',          authRoutes);
app.use('/api/laudos',        laudoRoutes);
app.use('/api/colaboradores', colaboradorRoutes); // 🆕

// Tratamento global de erros — captura qualquer erro não tratado nas rotas
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.message);
  res.status(500).json({ message: 'Erro interno no servidor.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`); // 🔧 backtick — interpola corretamente
});
