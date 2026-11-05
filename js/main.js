// main.js - Arquivo principal de controle de tela
import { loadAdminDashboardData } from './admin-dashboard.js';
import { renderOpsJobsUnified } from './ops-dashboard.js';

export function applyRole(perfilInput, usuario) {
    const perfil = (perfilInput || usuario?.perfil || '').trim().toUpperCase();

    // Adiciona classe no body para estilizações gerais se necessário
    document.body.classList.remove('perfil-admin', 'perfil-cliente', 'perfil-tecnico');
    document.body.classList.add(`perfil-${perfil.toLowerCase()}`);
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

    // 2. CONTROLE DA BARRA LATERAL (SIDEBAR NAVS)
    const adminNav = document.getElementById("adminNav");
    const clientNav = document.getElementById("clientNav");
    const techNav = document.getElementById("techNav");

    // Esconde todos os menus laterais primeiro
    if (adminNav) adminNav.classList.add('hidden');
    if (clientNav) clientNav.classList.add('hidden');
    if (techNav) techNav.classList.add('hidden');

    // 3. CONTROLE DE VISIBILIDADE DE SEÇÕES E MENUS POR PERFIL
    const secoesCliente = document.querySelectorAll('[id^="view-cliente-"]');
    const secoesTecnico = document.querySelectorAll('[id^="view-tecnico-"]');
    const secoesAdmin = document.querySelectorAll('[id^="view-admin-"], #view-dashboard, #view-clientes, #view-agenda, #view-ordens, #view-equipamentos, #view-alertas');
    const footerTecnico = document.getElementById("mobileTechFooter");
    const adminFab = document.getElementById("adminFab");

    const esconder = (elementos) => elementos.forEach(el => el.style.display = 'none');
    esconder(secoesCliente);
    esconder(secoesTecnico);
    esconder(secoesAdmin);

    if (perfil === 'CLIENTE') {
        if (footerTecnico) footerTecnico.style.display = 'none';
        if (adminFab) adminFab.style.display = 'none';
        if (clientNav) clientNav.classList.remove('hidden'); // Mostra apenas o menu do cliente

        const homeCliente = document.getElementById("view-cliente-home");
        if (homeCliente) homeCliente.style.display = 'block';
        if (typeof switchView === 'function') switchView('cliente-home', 'Meu Painel');
    } 
    else if (perfil === 'TECNICO') {
        if (footerTecnico) footerTecnico.style.display = 'flex';
        if (adminFab) adminFab.style.display = 'none';
        if (techNav) techNav.classList.remove('hidden'); // Mostra apenas o menu do técnico

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
        if (adminNav) adminNav.classList.remove('hidden'); // Mostra apenas o menu do admin

        const homeAdmin = document.getElementById("view-dashboard") || document.getElementById("view-admin-home");
        if (homeAdmin) homeAdmin.style.display = 'block';
        
        // CARREGA OS DADOS DO MYSQL NO DASHBOARD E TAMBÉM A TABELA DE OPERAÇÕES!
        loadAdminDashboardData();
        renderOpsJobsUnified(); 

        if (typeof switchView === 'function') switchView('dashboard', 'Dashboard');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Garante arrays globais seguros caso outras partes do sistema leiam antes da API
    window.U_ORDERS = window.U_ORDERS || [];
    window.U_TECHS = window.U_TECHS || {};

    // Limpeza de funções globais órfãs caso ainda existam no HTML
    if (typeof installOpsNav === 'function') installOpsNav();
    if (typeof renderOps === 'function') renderOps();
});

// Função para exibir o painel de solicitação de atendimento do cliente
window.showClientRequest = function() {
    // Esconde todas as seções de cliente primeiro (ou todas as views gerais)
    const secoes = document.querySelectorAll('.view');
    secoes.forEach(el => el.style.display = 'none');

    // Mostra especificamente a seção de solicitar atendimento
    const viewSolicitar = document.getElementById('view-cliente-solicitar');
    if (viewSolicitar) {
        viewSolicitar.style.display = 'block';
    }

    // Atualiza o título do topo se a função switchView existir, ou altera direto
    if (typeof switchView === 'function') {
        switchView('cliente-solicitar', 'Solicitar Atendimento');
    } else {
        const viewTitle = document.getElementById('viewTitle');
        if (viewTitle) viewTitle.innerText = 'Solicitar Atendimento';
    }
};

// Função para processar o envio da solicitação (opcional para dar feedback no vídeo)
window.submitClientRequest = function() {
    const equipamento = document.getElementById('clientReqEquip')?.value;
    const tipoServico = document.getElementById('clientReqType')?.value;
    const descricao = document.getElementById('clientReqNote')?.value;

    if (!descricao) {
        alert('Por favor, descreva o que está acontecendo.');
        return;
    }

    alert('Solicitação enviada com sucesso! Acompanhe o status pelo painel.');
    
    // Retorna para a home do cliente após enviar
    if (typeof switchView === 'function') {
        switchView('cliente-home', 'Meu Painel');
    } else {
        location.reload();
    }
};

window.applyRole = applyRole;