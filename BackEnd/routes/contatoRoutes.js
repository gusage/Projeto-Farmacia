// backend/src/routes/contatoRoutes.js
const router   = require('express').Router();
const mongoose = require('mongoose');

const ContatoSchema = new mongoose.Schema({
  nome:      { type: String, required: true },
  email:     { type: String, required: true },
  empresa:   { type: String, required: true },
  mensagem:  { type: String, required: true },
}, { timestamps: true });

const Contato = mongoose.model('Contato', ContatoSchema);

router.post('/', async (req, res) => {
  try {
    const contato = await Contato.create(req.body);
    res.status(201).json(contato);
  } catch {
    res.status(500).json({ message: 'Erro ao salvar contato.' });
  }
});

module.exports = router;