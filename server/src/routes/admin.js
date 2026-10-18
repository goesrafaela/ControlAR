const express = require('express');
const router = express.Router();

const db = require('../db');

router.get('/dashboard-orders', async (req, res) => {
    try {
        const query = `
            SELECT 
                os.id,
                a.inicio AS time,
                os.status,
                os.tecnico_id AS techKey,
                c.id AS cliente_id,
                c.nome_razao_social AS cliente_nome,
                t.id AS tecnico_id,
                u.nome AS tecnico_nome
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            LEFT JOIN tecnicos t ON os.tecnico_id = t.id
            LEFT JOIN usuarios u ON t.usuario_id = u.id
            LEFT JOIN agendamentos a ON os.agendamento_id = a.id
            ORDER BY a.inicio ASC
        `;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar OS para o dashboard:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

module.exports = router;