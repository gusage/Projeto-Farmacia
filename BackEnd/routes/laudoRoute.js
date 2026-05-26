// backend/routes/laudos.js
const express = require('express');
const router = express.Router();
const Laudo = require('../models/laudo');
const authMiddleware = require('../middleware/authMiddleware');

// 1. REGISTRAR COLETA / LAUDO (Qualquer técnico ou farmacêutico logado)
router.post('/registrar', authMiddleware, async (req, res) => {
    try {
        const { ambiente, tipoAmostragem, ufcEncontrado, microorganismo, status, observacoes } = req.body;

        const novoLaudo = new Laudo({
            responsavel: req.user.id, // Pego diretamente do JWT decodificado
            ambiente,
            tipoAmostragem,
            ufcEncontrado,
            microorganismo,
            status,
            observacoes
        });

        await novoLaudo.save();
        res.status(201).json({ message: "Laudo registrado com sucesso!", novoLaudo });
    } catch (error) {
        res.status(500).json({ message: "Erro ao salvar o laudo.", error });
    }
});

// 2. CONSULTAR TODOS OS LAUDOS (Com dados do responsável inclusos)
router.get('/consultar', authMiddleware, async (req, res) => {
    try {
        const { status } = req.query; // Pega o status da URL, se houver
        let filtro = {};
        if (status) {
            filtro.status = status; // Aplica o filtro de status se for fornecido
        }
        // O .populate('responsavel', 'nome email') traz os dados de quem coletou, ocultando a senha
        const laudos = await Laudo.find(filtro).populate('responsavel', 'nome email').sort({ dataColeta: -1 });
        
        res.json(laudos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar laudos." });
    }
});

// 3. DADOS PARA GRÁFICO DE TENDÊNCIA (Últimos 3 meses agrupados por ambiente)
router.get('/tendencias', authMiddleware, async (req, res) => {
    try {
        // Busca os laudos dos últimos 90 dias, por exemplo
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 90);

        const dadosTendencia = await Laudo.find({
            dataColeta: { $gte: dataLimite }
        })
        .select('ambiente ufcEncontrado dataColeta status')
        .sort({ dataColeta: 1 }); // Ordem cronológica para o gráfico

        res.json(dadosTendencia);
    } catch (error) {
        res.status(500).json({ message: "Erro ao processar tendências." });
    }
});

// 4. ROTA DE BUSCA AVANÇADA COM FILTROS (Dinamismo para Desktop e Mobile)
router.get('/buscar-filtros', authMiddleware, async (req, res) => {
    try {
        // Pega os parâmetros enviados na URL (Query Params)
        const { ambiente, status, dataInicio, dataFim } = req.query;
        
        // Cria um objeto de consulta vazio
        let query = {};

        // 1. Filtro por Ambiente (Busca por texto parcial, ignorando maiúsculas/minúsculas)
        if (ambiente) {
            query.ambiente = { $regex: ambiente, $options: 'i' };
        }

        // 2. Filtro por Status (Conforme, Alerta, Inconforme)
        if (status) {
            query.status = status;
        }

        // 3. Filtro por Período de Datas
        if (dataInicio || dataFim) {
            query.dataColeta = {};
            if (dataInicio) {
                query.dataColeta.$gte = new Date(dataInicio); // A partir desta data
            }
            if (dataFim) {
                // Define o final do dia escolhido para não perder coletas feitas à tarde
                const dataFechamento = new Date(dataFim);
                dataFechamento.setHours(23, 59, 59, 999);
                query.dataColeta.$lte = dataFechamento; // Até esta data
            }
        }

        // Executa a busca no MongoDB com os filtros acumulados
        const laudosFiltrados = await Laudo.find(query)
            .populate('responsavel', 'nome email') // Traz quem fez a coleta
            .sort({ dataColeta: -1 }); // Mais recentes primeiro

        res.json(laudosFiltrados);

    } catch (error) {
        res.status(500).json({ message: "Erro ao processar a busca com filtros.", error });
    }
});

// 5. Rota para atualizar o status (usada pela farmacêutica)
router.put('/atualizar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log(`--> Tentando atualizar o laudo ${id} para o status: ${status}`);

        const laudoAtualizado = await Laudo.findByIdAndUpdate(
            id, 
            { status }, 
            { returnDocument: 'after', runValidators: true } // runValidators garante que o banco valide o novo status
        );

        // Se o ID não for encontrado no banco
        if (!laudoAtualizado) {
            console.log(`X Laudo ${id} não foi encontrado no banco.`);
            return res.status(404).json({ message: "Laudo não encontrado no banco de dados." });
        }

        console.log(`✅ Laudo ${id} atualizado com sucesso no Atlas!`);
        res.json(laudoAtualizado);

    } catch (error) {
        console.error("Erro interno no backend ao atualizar:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao salvar análise." });
    }
});

module.exports = router;
