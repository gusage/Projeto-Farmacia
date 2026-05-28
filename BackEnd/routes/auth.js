// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); // Importa o modelo que criamos no Passo 1
const autenticar = require('../middleware/authMiddleware');
const checkRole  = require('../middleware/roleMiddleware');

// 1. ROTA DE CADASTRO (REGISTRAR NOVAS FARMACÊUTICAS/TÉCNICAS)
router.post('/registrar', autenticar, async (req, res) => {
  // opcional: checar se quem está cadastrando tem role 'farmaceutica'
  if (req.usuario.role !== 'farmaceutica') {
    return res.status(403).json({ message: 'Apenas farmacêuticos podem cadastrar usuários.' });
  }

    const { nome, email, senha, role } = req.body;

    try {
        // Validação: Verificar se o e-mail já existe no sistema
        let usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: "Este e-mail já está cadastrado no sistema." });
        }

        // Criptografia: Gerar o hash seguro para a senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // Criar o novo usuário com a senha protegida
        const novoUsuario = new Usuario({
            nome,
            email,
            senha: senhaCriptografada,
            role
        });

        // Salvar no banco de dados
        await novoUsuario.save();

        res.status(201).json({ 
            message: `Usuário (${role}) cadastrado com sucesso!`,
            user: { id: novoUsuario._id, nome: novoUsuario.nome, email: novoUsuario.email, role: novoUsuario.role }
        });

    } catch (error) {
        res.status(500).json({ message: "Erro ao cadastrar o usuário no servidor.", error });
    }
});

// 2. ROTA DE LOGIN (AUTENTICAR COM DADOS REAIS DO BANCO)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar o usuário pelo e-mail
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ message: "Credenciais inválidas (E-mail ou senha incorretos)." });
        }

        // Comparar a senha digitada com a senha criptografada do banco
        const senhaCorreta = await bcrypt.compare(password, usuario.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ message: "Credenciais inválidas (E-mail ou senha incorretos)." });
        }

        // Gerar o Token JWT incluindo o ID, Nome e o Cargo (Role) no payload
        const token = jwt.sign(
            { id: usuario._id, nome: usuario.nome, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token dura um turno de trabalho comum (8 horas)
        );

        // Retorna o token e os dados que o React vai precisar para montar a tela
        res.json({
            token,
            user: { id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role }
        });

    } catch (error) {
        res.status(500).json({ message: "Erro ao processar o login no servidor." });
    }
});

module.exports = router;
