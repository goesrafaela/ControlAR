const express = require('express');
const router = express.Router();
const db = require('../db');
const { HTTP_STATUS } = require('../constants');
const { verificarCredenciaisUsuario } = require('../utils/auth'); // Reutiliza a mesma função centralizada!

// GET /api/clients - Listar todos os clientes do ControlAr
router.get('/', async (req, res) => {
  try {
    const [clients] = await db.query(
      'SELECT * FROM clientes'
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Clientes listados com sucesso',
      data: clients
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar clientes no banco de dados'
    });
  }
});

// POST /api/clients/login - Rota de login para clientes (se aplicável ao seu sistema)
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  // Se a tabela de clientes for separada da tabela de usuários, 
  // você pode adaptar a verificação aqui ou unificar no auth.js. 
  // Usando a mesma função centralizada:
  const resultado = await verificarCredenciaisUsuario(email, senha);

  if (!resultado.valido) {
    return res.status(resultado.status).json({
      success: false,
      message: resultado.mensagem
    });
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login de cliente realizado com sucesso!",
    data: resultado.usuario
  });
});

module.exports = router;