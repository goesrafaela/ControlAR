const express = require('express');
const router = express.Router();
const db = require('../db');
const { SERVER_MESSAGES, HTTP_STATUS } = require('../constants');

// GET /api/users - Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, nome, email, perfil, ativo, ultimo_acesso, criado_em, atualizado_em FROM usuarios'
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SERVER_MESSAGES.USERS_FETCH_SUCCESS,
      data: users
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: SERVER_MESSAGES.USERS_FETCH_ERROR
    });
  }
});

module.exports = router;