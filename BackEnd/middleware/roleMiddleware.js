// backend/middleware/roleMiddleware.js

// A função recebe um array de roles permitidas (ex: ['admin', 'farmaceutico'])
const checkRole = (rolesPermitidas) => {
    return (req, res, next) => {
        // O req.user foi definido no authMiddleware anterior após decodificar o JWT
        if (!req.user || !rolesPermitidas.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Acesso negado: Seu nível de acesso não permite esta ação." 
            });
        }
        next(); // Usuário tem permissão, pode seguir para a rota
    };
};

module.exports = checkRole;
