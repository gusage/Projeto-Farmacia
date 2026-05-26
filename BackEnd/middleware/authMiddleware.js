// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Busca o token no cabeçalho da requisição
    const token = req.header('Authorization')?.split(' ')[1]; // Formato "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
    }

    try {
        // Valida o token com a nossa chave secreta
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado; // Adiciona os dados do usuário na requisição
        next(); // Vai para a próxima função (a rota protegida)
    } catch (error) {
        res.status(400).json({ message: "Token inválido." });
    }
};
