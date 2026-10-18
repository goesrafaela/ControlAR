// login-mock.js é um arquivo auxiliar para facilitar os testes do protótipo

async function carregarUsuariosDoBancoParaLogin() {
    const container = document.querySelector(".login-account-grid");
    if (!container) return;

    try {
        const response = await fetch('/api/users');
        const usuariosDoBanco = await response.json();

        if (!Array.isArray(usuariosDoBanco) || usuariosDoBanco.length === 0) {
            container.innerHTML = "<p>Nenhum usuário encontrado no banco.</p>";
            return;
        }

        container.innerHTML = usuariosDoBanco.map(user => {
            let cargoTitulo = "Usuário";
            if (user.perfil === 'ADMIN') cargoTitulo = "Administrador";
            else if (user.perfil === 'TECNICO') cargoTitulo = "Técnico";
            else if (user.perfil === 'CLIENTE') cargoTitulo = "Cliente";

            return `
                <div class="login-account" onclick="preencherCamposLogin('${user.email}', '${user.senha}', '${user.perfil}', this)">
                    <b>${cargoTitulo}</b>
                    <small>${user.nome}</small>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Erro ao buscar usuários do MySQL:", error);
        container.innerHTML = "<p style='color: red;'>Erro ao conectar com o banco de dados.</p>";
    }
}

function preencherCamposLogin(email, senha, perfil, elementoCard) {
    const inputEmail = document.getElementById("loginEmail");
    const inputSenha = document.getElementById("loginPassword");

    if (inputEmail) {
        inputEmail.value = email;
        inputEmail.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (inputSenha) {
        inputSenha.value = senha;
        inputSenha.dispatchEvent(new Event('input', { bubbles: true }));
    }

    document.querySelectorAll(".login-account").forEach(card => card.classList.remove("active"));
    if (elementoCard) elementoCard.classList.add("active");

    window.currentAccount = { email, role: perfil };
}

window.addEventListener("DOMContentLoaded", () => {
    carregarUsuariosDoBancoParaLogin();
});