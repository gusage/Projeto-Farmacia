// backend/src/routes/laudoRoutes.js
const router = require('express').Router();
const Laudo = require('../models/Laudo');

// 📋 REGISTRO EM LOTE ADAPTADO
router.post('/registrar-lote', async (req, res) => {
    try {
        const { tipoColeta, dataColeta, turno, responsavelColeta, statusGeral, amostras } = req.body;

        const documentosParaSalvar = amostras.map(amostra => {
            // Base do documento comum a qualquer tipo de coleta
            let doc = {
                tipoColeta,
                dataColeta,
                turno,
                responsavelColeta,
                status: statusGeral || 'Pendente Análise',
                observacoesCampo: amostra.observacoesCampo || ''
            };

            // Se for Monitoramento de Pessoal (Verifica se veio colaboradorId no payload)
            if (amostra.colaboradorId) {
                doc.colaboradorId = muestra.colaboradorId;
                doc.loteBact = amostra.loteBact || '';
                doc.loteFung = amostra.loteFung || '';
            } 
            // Caso contrário, trata como Monitoramento Ambiental de área
            else {
                doc.pontoId = amostra.pontoId;
                doc.loteOperacional = amostra.loteOperacional || '';
            }

            return doc;
        });

        const resultados = await Laudo.insertMany(documentosParaSalvar);
        
        console.log(`✅ ${resultados.length} registros inseridos com sucesso no Atlas!`);
        res.status(201).json({ message: "Lote registrado com sucesso!", quantidade: resultados.length });
    } catch (error) {
        console.error("Erro no processamento do lote:", error);
        res.status(500).json({ message: "Erro interno no servidor ao salvar lote." });
    }
});

// 🔍 CONSULTA ATUALIZADA
router.get('/consultar', async (req, res) => {
    try {
        const { status } = req.query;
        let filtro = {};
        if (status) filtro.status = status;

        const laudos = await Laudo.find(filtro).sort({ createdAt: -1 });
        res.json(laudos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao consultar dados." });
    }
});

module.exports = router;
