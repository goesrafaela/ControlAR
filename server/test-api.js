const http = require('http');

console.log('🔄 Tentando conectar em http://127.0.0.1:3000/api/users...');

http.get('http://127.0.0.1:3000/api/users', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📥 Resposta recebida com sucesso da API:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
}).on('err', (err) => {
  console.error('\n❌ Conexão recusada:', err.message);
  console.log('💡 Dica: Verifique se o seu servidor (node index.js) está rodando em outro terminal.');
});