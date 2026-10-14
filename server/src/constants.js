// server/src/constants.js - Constantes e mensagens do servidor
const SERVER_MESSAGES = {
  RUNNING: (port) => `🚀 Servidor rodando na porta ${port}`,
  DB_CONNECTED: '✅ Conexão com o banco de dados estabelecida com sucesso!',
  DB_DISCONNECTED: '❌ Erro ao conectar ao banco de dados:',
  USERS_FETCH_SUCCESS: 'Usuários listados com sucesso.',
  USERS_FETCH_ERROR: 'Erro ao buscar usuários do banco de dados.'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  SERVER_MESSAGES,
  HTTP_STATUS
};