window.switchView = function(targetView) {

    // 1. Força a ocultação de TODAS as seções da página via estilo direto
    const allViews = document.querySelectorAll("main.main > section.view");
    allViews.forEach(view => {
        view.style.display = "none";
        view.classList.remove("active");
    });

    // 2. Encontra a seção específica baseada no ID (ex: view-clientes, view-dashboard)
    const targetSection = document.getElementById(`view-${targetView}`);
    if (targetSection) {
        targetSection.style.display = "block";
        targetSection.classList.add("active");
    } else {
        console.warn("Atenção: Não encontrei nenhuma seção com o ID view-" + targetView);
    }

    // 3. Atualiza o visual dos botões no menu lateral
    const allButtons = document.querySelectorAll(".side-nav button[data-view]");
    allButtons.forEach(btn => {
        if (btn.getAttribute("data-view") === targetView) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // 4. Atualiza o título principal se o elemento existir
    const titleEl = document.getElementById("viewTitle");
    if (titleEl) {
        const titles = {
            "dashboard": "Dashboard",
            "clientes": "Gestão de Clientes",
            "agenda": "Agenda Operacional",
            "ordens": "Ordens de Serviço",
            "equipamentos": "Equipamentos",
            "alertas": "Central de Alertas"
        };
        titleEl.textContent = titles[targetView] || "Painel";
    }

    // 5. Se for clientes, atualiza os dados do banco
    if (targetView === 'clientes' && typeof renderClients === 'function') {
        renderClients();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll(".side-nav button[data-view]");
    
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const viewName = button.getAttribute("data-view");
            if (viewName) {
                switchView(viewName);
            }
        });
    });

    // Abre direto no Dashboard ao carregar
    switchView("dashboard");
});