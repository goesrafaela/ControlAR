const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/ordens', async (req, res) => {
    const { tecnico } = req.query;

    try {
        const query = `
            SELECT 
                os.id,
                os.status,
                c.nome_razao_social AS cliente,
                a.inicio AS horario
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            LEFT JOIN tecnicos t ON os.tecnico_id = t.id
            LEFT JOIN usuarios u ON t.usuario_id = u.id
            LEFT JOIN agendamentos a ON os.agendamento_id = a.id
            WHERE u.nome = ?
            ORDER BY a.inicio ASC
        `;

        const [rows] = await db.query(query, [tecnico]);
        res.json(rows);
    } catch (erro) {
        console.error('Erro ao buscar ordens do técnico:', erro);
        res.status(500).json({ erro: 'Erro interno ao carregar ordens de serviço' });
    }
});

module.exports = router;