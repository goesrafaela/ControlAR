const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const { SERVER_MESSAGES } = require('./src/constants');

// 1. Middlewares globais 
app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

// 2. Inicializa a conexão com o banco de dados
require('./src/db');

// 3. Registro de rotas da API
const usersRoutes = require('./src/routes/users');
app.use('/api/users', usersRoutes);

const clientRoutes = require('./src/routes/clients');
app.use('/api/clients', clientRoutes);

// 4. Inicialização única do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const msg = SERVER_MESSAGES && SERVER_MESSAGES.RUNNING ? SERVER_MESSAGES.RUNNING(PORT) : `Servidor rodando na porta ${PORT}`;
    console.log(msg);
});