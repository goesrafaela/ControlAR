async function loginSelectedAccount() {
    const inputEmail = document.getElementById("loginEmail");
    const inputSenha = document.getElementById("loginPassword");

    const email = inputEmail ? inputEmail.value : "";
    const senha = inputSenha ? inputSenha.value : "";

    // Validação básica no front para evitar requisições vazias
    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha (ou clique em um card de acesso rápido).");
        return;
    }

    try {
        // 1. Dispara a requisição para a nossa rota segura no back-end (que usa bcrypt)
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const resultado = await response.json();

        // 2. Se a senha estiver errada ou vazia, o back-end barra e avisamos o usuário
        if (!resultado.success) {
            alert(resultado.message || "E-mail ou senha inválidos.");
            return; // Interrompe aqui e não deixa entrar no sistema!
        }

        // 3. Se o back-end APROVAR, pegamos os dados seguros que vieram do MySQL
        const usuarioLogado = resultado.data;

        // Salva na sessão do navegador
        localStorage.setItem("controlar_current_account", JSON.stringify(usuarioLogado));

        // 4. Executa o ritual visual para abrir o protótipo
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