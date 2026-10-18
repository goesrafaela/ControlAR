const mysql = require('mysql2');
require('dotenv').config();
const { SERVER_MESSAGES } = require('./constants');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'controlar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão imediatamente usando as constantes
pool.getConnection((err, connection) => {
    if (err) {
        console.error(`${SERVER_MESSAGES.DB_DISCONNECTED} ${err.message}`);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Dica: Parece que o usuário ou a senha do MySQL estão incorretos.');
        }
    } else {
        console.log(SERVER_MESSAGES.DB_CONNECTED);
        connection.release();
    }
});

module.exports = pool.promise();