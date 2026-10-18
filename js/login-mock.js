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

        renderizarCards(usuariosDoBanco, container);

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

async function carregarPorPerfil(perfilDesejado) {
    const container = document.querySelector(".login-account-grid");
    if (!container) return;

    try {
        const response = await fetch('/api/users');
        const usuariosDoBanco = await response.json();

        if (!Array.isArray(usuariosDoBanco)) return;

        const usuariosFiltrados = usuariosDoBanco.filter(user => {
            if (perfilDesejado === 'TECNICO') {
                return user.perfil === 'TECNICO' || user.perfil === 'ADMIN';
            }
            return user.perfil === perfilDesejado;
        });

        if (usuariosFiltrados.length === 0) {
            container.innerHTML = `<p style="padding:10px;">Nenhum usuário encontrado no banco.</p>`;
            return;
        }

        renderizarCards(usuariosFiltrados, container);

    } catch (error) {
        console.error("Erro ao carregar perfis:", error);
    }
}

function renderizarCards(usuarios, container) {
    container.innerHTML = usuarios.map(user => {
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
}

window.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".login-account-grid");
    if (container) {
        container.innerHTML = "<p style='padding: 10px; color: #666;'>Selecione uma área acima para ver os usuários disponíveis.</p>";
    }
});