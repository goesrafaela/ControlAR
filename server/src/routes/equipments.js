const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste o caminho caso o seu arquivo de conexão esteja em outro lugar

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, c.nome_razao_social as cliente_nome 
            FROM equipamentos e 
            LEFT JOIN clientes c ON e.cliente_id = c.id
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Erro ao buscar equipamentos:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor" });
    }
});

module.exports = router;