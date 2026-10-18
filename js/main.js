// main.js - Arquivo principal de controle de tela
import { loadAdminDashboardData } from './admin-dashboard.js';

export function applyRole(perfilInput, usuario) {
    // BLindagem: Normaliza o perfil para maiúsculo e garante que não é nulo
    const perfil = (perfilInput || usuario?.perfil || '').trim().toUpperCase();

    document.body.classList.toggle("admin-session", perfil === 'ADMIN');
    
    // 1. ATUALIZA O CABEÇALHO (Nome, Cargo e Avatar)
    if (usuario) {
        const profileName = document.getElementById("profileName");
        if (profileName) profileName.innerText = usuario.nome;

        const profileRole = document.getElementById("profileRole");
        if (profileRole) {
            let cargoFormatado = "Usuário";
            if (perfil === 'ADMIN') cargoFormatado = "Administrador";
            else if (perfil === 'TECNICO') cargoFormatado = "Técnico";
            else if (perfil === 'CLIENTE') cargoFormatado = "Cliente";
            profileRole.innerText = cargoFormatado;
        }

        const profileAvatar = document.getElementById("profileAvatar");
        if (profileAvatar && usuario.nome) {
            const iniciais = usuario.nome
                .split(" ")
                .filter(n => n.length > 0)
                .map(n => n.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();
            profileAvatar.innerText = iniciais;
        }
    }


    // 2. CONTROLE DE VISIBILIDADE DE SEÇÕES
    const secoesCliente = document.querySelectorAll('[id^="view-cliente-"]');
    const secoesTecnico = document.querySelectorAll('[id^="view-tecnico-"]');
    const secoesAdmin = document.querySelectorAll('[id^="view-admin-"]');
    const viewDashboard = document.getElementById("view-dashboard"); // <--- O fugitivo!
    const footerTecnico = document.getElementById("mobileTechFooter");
    const adminFab = document.getElementById("adminFab");

    const esconder = (elementos) => elementos.forEach(el => el.style.display = 'none');
    esconder(secoesCliente);
    esconder(secoesTecnico);
    esconder(secoesAdmin);
    if (viewDashboard) viewDashboard.style.display = 'none'; // <--- Garante que o dashboard some para os outros perfis

    console.log("Aplicando perfil com segurança:", perfil); // Ajuda a debugar no F12 se precisar

    if (perfil === 'CLIENTE') {
        if (footerTecnico) footerTecnico.style.display = 'none';
        if (adminFab) adminFab.style.display = 'none';
        const homeCliente = document.getElementById("view-cliente-home");
        if (homeCliente) homeCliente.style.display = 'block';
        if (typeof switchView === 'function') switchView('cliente-home', 'Meu Painel');
    } 
    else if (perfil === 'TECNICO') {
        if (footerTecnico) footerTecnico.style.display = 'flex';
        if (adminFab) adminFab.style.display = 'none';
        const homeTecnico = document.getElementById("view-tecnico-home");
        if (homeTecnico) homeTecnico.style.display = 'block';
        if (typeof renderUnifiedTechnician === 'function') {
            renderUnifiedTechnician();
        }
        if (typeof switchView === 'function') switchView('tecnico-home', 'Minha rota');
    } 
    else if (perfil === 'ADMIN') {
        if (footerTecnico) footerTecnico.style.display = 'none';
        if (adminFab) adminFab.style.display = 'flex';
        const homeAdmin = document.getElementById("view-admin-home") || document.getElementById("view-dashboard");
        if (homeAdmin) homeAdmin.style.display = 'block';
        
        // DISPARA O CARREGAMENTO DOS DADOS DO MYSQL NO DASHBOARD!
        loadAdminDashboardData();

        if (typeof switchView === 'function') switchView('admin-home', 'Dashboard');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Limpeza de funções globais órfãs caso ainda existam no HTML
    if (typeof installOpsNav === 'function') installOpsNav();
    if (typeof renderOps === 'function') renderOps();
});

window.applyRole = applyRole;