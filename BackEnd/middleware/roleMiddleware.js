// backend/middleware/roleMiddleware.js
const checkRole = (rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.user) {
      // Proteção caso checkRole seja usado sem authMiddleware antes
      return res.status(401).json({ message: 'Não autenticado.' });
    }

    if (!rolesPermitidas.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acesso negado: seu nível de acesso não permite esta ação.',
      });
    }

    next();
  };
};

module.exports = checkRole;
