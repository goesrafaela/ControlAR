// utils/authHelper.js - Centraliza a lógica de verificação com bcrypt e banco porém não está em funcionamento

const bcrypt = require('bcrypt');
const db = require('../db');

async function autenticarUsuario(email, senhaFornecida) {
    if (!email || !senhaFornecida) {
        return { valido: false, status: 400, mensagem: "E-mail e senha são obrigatórios." };
    }

    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            return { valido: false, status: 401, mensagem: "E-mail ou senha inválidos." };
        }

        const usuario = rows[0];

        if (!usuario.senha) {
            return { valido: false, status: 401, mensagem: "Usuário sem senha cadastrada no banco." };
        }

        const senhaValida = await bcrypt.compare(senhaFornecida, usuario.senha);

        if (!senhaValida) {
            return { valido: false, status: 401, mensagem: "E-mail ou senha inválidos." };
        }

        const { senha, ...dadosSeguros } = usuario;
        return { valido: true, status: 200, usuario: dadosSeguros };

    } catch (error) {
        console.error("Erro na autenticação:", error);
        return { valido: false, status: 500, mensagem: "Erro interno no servidor." };
    }
}

module.exports = { autenticarUsuario };