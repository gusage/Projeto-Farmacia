// backend/src/routes/colaboradorRoutes.js
const router      = require('express').Router();
const Colaborador = require('../models/Colaborador');
const autenticar = require('../middleware/authMiddleware');
const checkRole  = require('../middleware/roleMiddleware');

router.use(autenticar);

// GET /colaboradores
router.get('/', async (req, res) => {
  try {
    const colaboradores = await Colaborador.find().sort({ nome: 1 });
    res.json(colaboradores);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar colaboradores.' });
  }
});

// POST /colaboradores
router.post('/', async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome?.trim()) return res.status(400).json({ message: 'Nome obrigatório.' });

    const existe = await Colaborador.findOne({ nome: nome.trim() });
    if (existe) return res.status(409).json({ message: 'Colaborador já cadastrado.' });

    const novo = await Colaborador.create({ nome: nome.trim() });
    res.status(201).json(novo);
  } catch {
    res.status(500).json({ message: 'Erro ao cadastrar colaborador.' });
  }
});

// DELETE /colaboradores/:id
router.delete('/:id', async (req, res) => {
  try {
    const removido = await Colaborador.findByIdAndDelete(req.params.id);
    if (!removido) return res.status(404).json({ message: 'Colaborador não encontrado.' });

    res.json({ message: 'Colaborador removido.' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover colaborador.' });
  }
});

module.exports = router;
