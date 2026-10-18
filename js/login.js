async function loginSelectedAccount() {
    const inputEmail = document.getElementById("loginEmail");
    const inputSenha = document.getElementById("loginPassword");

    const email = inputEmail ? inputEmail.value : "";
    const senha = inputSenha ? inputSenha.value : "";

    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha (ou clique em um card de acesso rápido).");
        return;
    }

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const resultado = await response.json();

        if (!resultado.success) {
            alert(resultado.message || "E-mail ou senha inválidos.");
            return; 
        }

        const usuarioLogado = resultado.data;

        localStorage.setItem("controlar_current_account", JSON.stringify(usuarioLogado));

        if (typeof closeModal === 'function') closeModal("loginModal");
        
        document.getElementById("site").style.display = "none";
        document.getElementById("app").style.display = "block";

        if (typeof applyRole === 'function') applyRole(usuarioLogado.perfil, usuarioLogado);
        if (typeof carregarDadosDoServidor === 'function') carregarDadosDoServidor();
        if (typeof renderAll === 'function') renderAll();

        console.log("Login autorizado para:", usuarioLogado.nome);

    } catch (error) {
        console.error("Erro na comunicação com o servidor:", error);
        alert("Erro ao tentar conectar com o servidor. Verifique se o back-end está rodando.");
    }
}