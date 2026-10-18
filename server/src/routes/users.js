const express = require('express');
const router = express.Router();
const db = require('../db');
const { HTTP_STATUS } = require('../constants');

// Rota GET /api/users - Lista todos os usuários relacionando com a tabela clientes via usuario_id
router.get('/', async (req, res) => {
    try {
        const querySQL = `
            SELECT 
                u.id, 
                u.nome, 
                u.email, 
                u.perfil, 
                u.senha_hash AS senha,
                c.id AS cliente_id
            FROM usuarios u
            LEFT JOIN clientes c ON c.usuario_id = u.id
        `;

        const [usuarios] = await db.query(querySQL);
        
        console.log('📦 Dados vindos do MySQL com JOIN:', usuarios);
        return res.status(HTTP_STATUS.OK).json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Erro ao conectar com o banco de dados.'
        });
    }
});

// Rota POST /api/users/login - Valida o e-mail e traz os dados do usuário + vínculo do cliente
router.post('/login', async (req, res) => {
    const { email } = req.body;

    try {
        const querySQL = `
            SELECT 
                u.id, 
                u.nome, 
                u.email, 
                u.perfil,
                c.id AS cliente_id
            FROM usuarios u
            LEFT JOIN clientes c ON c.usuario_id = u.id
            WHERE u.email = ?
        `;

        const [rows] = await db.query(querySQL, [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        const usuario = rows[0];

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Login realizado com sucesso!",
            data: usuario
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Erro interno no servidor.'
        });
    }
});

module.exports = router;