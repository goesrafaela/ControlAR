const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { SERVER_MESSAGES } = require('./src/constants');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da raiz do projeto (um nível acima de 'server')
app.use(express.static(path.join(__dirname, '..')));

// Inicializa a conexão com o banco de dados
require('./src/db');

// Registro de rotas da API
const usersRoutes = require('./src/routes/users');
app.use('/api/users', usersRoutes);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(SERVER_MESSAGES.RUNNING(PORT));
});