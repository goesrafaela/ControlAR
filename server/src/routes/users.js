const express = require('express');
const router = express.Router();
const db = require('../db');
const { HTTP_STATUS } = require('../constants');

router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT id, nome, email, perfil, senha_hash AS senha 
            FROM usuarios
        `);
        
        return res.status(HTTP_STATUS.OK).json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Erro ao conectar com o banco de dados.'
        });
    }
});

router.post('/login', async (req, res) => {
    const { email } = req.body;

    try {
        const [rows] = await db.query('SELECT id, nome, email, perfil FROM usuarios WHERE email = ?', [email]);

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