const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const { SERVER_MESSAGES } = require('./src/constants');

app.use(express.json());

const usersRoutes = require('./src/routes/users');
app.use('/api/users', usersRoutes);

const clientRoutes = require('./src/routes/clients');
app.use('/api/clients', clientRoutes);

const adminRoutes = require('./src/routes/admin'); // (Confira se o arquivo se chama admin.js)
app.use('/api/admin', adminRoutes);

app.use(express.static(path.join(__dirname, '..')));

require('./src/db');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const msg = SERVER_MESSAGES && SERVER_MESSAGES.RUNNING ? SERVER_MESSAGES.RUNNING(PORT) : `Servidor rodando na porta ${PORT}`;
    console.log(msg);
});