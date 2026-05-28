// backend/src/routes/laudoRoutes.js
const router      = require('express').Router();
const Laudo       = require('../models/Laudo');
const autenticar = require('../middleware/authMiddleware');
const checkRole  = require('../middleware/roleMiddleware');

router.use(autenticar); // protege TODAS as rotas deste arquivo de uma vez

// POST /laudos/registrar-lote
router.post('/registrar-lote', autenticar, async (req, res) => {
  try {
    const { tipoColeta, dataColeta, turno, responsavelColeta, statusGeral, amostras } = req.body;

    const documentos = amostras.map(amostra => {
      const doc = {
        tipoColeta,
        dataColeta,
        turno,
        responsavelColeta,
        status: statusGeral || 'Pendente Análise',
        observacoesCampo: amostra.observacoesCampo || '',
      };

      if (amostra.colaboradorId) {
        doc.colaboradorId   = amostra.colaboradorId; // 🔧 era "muestra" — typo corrigido
        doc.loteBact        = amostra.loteBact || '';
        doc.loteFung        = amostra.loteFung || '';
      } else {
        doc.pontoId         = amostra.pontoId;
        doc.loteOperacional = amostra.loteOperacional || '';
      }

      return doc;
    });

    const resultados = await Laudo.insertMany(documentos);
    res.status(201).json({ message: 'Lote registrado com sucesso!', quantidade: resultados.length });
  } catch (error) {
    console.error('Erro ao salvar lote:', error);
    res.status(500).json({ message: 'Erro interno ao salvar lote.' });
  }
});

// GET /laudos/consultar?status=Pendente Análise
router.get('/consultar', autenticar, async (req, res) => {
  try {
    const filtro = {};
    if (req.query.status) filtro.status = req.query.status;

    const laudos = await Laudo.find(filtro).sort({ createdAt: -1 });
    res.json(laudos);
  } catch (error) {
    console.error('Erro ao consultar laudos:', error);
    res.status(500).json({ message: 'Erro ao consultar dados.' });
  }
});

// PUT /laudos/atualizar/:id  🆕 — usado pelo AnaliseLaudos
router.put('/atualizar/:id', autenticar, checkRole(['farmaceutica']), async (req, res) => {
  try {
    const laudo = await Laudo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!laudo) return res.status(404).json({ message: 'Laudo não encontrado.' });

    res.json(laudo);
  } catch (error) {
    console.error('Erro ao atualizar laudo:', error);
    res.status(500).json({ message: 'Erro ao atualizar laudo.' });
  }
});

module.exports = router;
