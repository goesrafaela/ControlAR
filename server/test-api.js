const db = require('./src/db');

async function testarUsuariosNoTerminal() {
    try {
        console.log('Buscando usuários no MySQL...');
        const [rows] = await db.query('SELECT id, nome, email, perfil FROM usuarios');
        
        console.log('\n--- USUÁRIOS ENCONTRADOS NO BANCO ---');
        console.table(rows); // Exibe os usuários em formato de tabela no terminal
        
    } catch (error) {
        console.error('Erro ao conectar ou buscar usuários:', error);
    } finally {
        process.exit(); // Encerra o script após o teste
    }
}

testarUsuariosNoTerminal();