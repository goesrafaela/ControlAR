const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'controlar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa a conexão imediatamente
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro ao conectar no MySQL:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Dica: Parece que o usuário ou a senha do MySQL estão incorretos.');
    }
  } else {
    console.log('✅ Conexão com o banco de dados "controlar" estabelecida com sucesso!');
    connection.release();
  }
});

module.exports = pool.promise();