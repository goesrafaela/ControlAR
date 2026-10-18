// adminDashboard.js - Lógica e renderização do Dashboard Admin
import { getAdminDashboardOrders } from './api.js';

// 1. Função que busca os dados reais do MySQL e popula/atualiza a lista de ordens
export async function loadAdminDashboardData() {
    try {
        const data = await getAdminDashboardOrders();

        if (Array.isArray(data) && data.length > 0) {
            // Guarda/atualiza a lista no objeto global da janela
            window.U_ORDERS = data.map(item => ({
                id: item.id,
                time: item.time,
                status: item.status,
                techKey: item.techKey,
                cliente: { id: item.cliente_id, name: item.cliente_nome },
                tech: { id: item.tecnico_id, name: item.tecnico_nome }
            }));
        }

        // Desenha a tela do dashboard com os dados atualizados
        renderAdminDashboardUnified();
    } catch (err) {
        console.error("Erro ao carregar dados do dashboard admin:", err);
    }
}

// 2. Auxiliar para preparar as linhas unificadas de ordens, clientes e técnicos
function adminUnifiedRows() {
    const orders = window.U_ORDERS || [];
    return orders.slice().sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(o => ({
        o,
        c: o.cliente || (typeof window.uClient === 'function' ? window.uClient(o) : { id: '', name: 'Cliente' }),
        tech: o.tech || (typeof window.uTech === 'function' ? window.uTech(o.techKey) : { name: 'Técnico' })
    }));
}

// 3. Renderiza os cartões de KPI, painel da equipe e próximos atendimentos
export function renderAdminDashboardUnified() {
    const v = document.getElementById("view-dashboard");
    if (!v) return;

    const rows = adminUnifiedRows();
    const pending = rows.filter(x => /pendente|confirma/i.test(x.o.status)).length;
    const active = rows.filter(x => /atendimento|deslocamento/i.test(x.o.status)).length;

    v.innerHTML = `
        <div class="kpis">
            <div class="kpi">
                <div class="label">CLIENTES EM ATENDIMENTO</div>
                <div class="num">${new Set(rows.map(x => x.c.id)).size}</div>
                <div class="trend">base atual das OS</div>
            </div>
            <div class="kpi">
                <div class="label">OS DISTRIBUÍDAS</div>
                <div class="num">${rows.length}</div>
                <div class="trend">técnicos ativos</div>
            </div>
            <div class="kpi">
                <div class="label">EM EXECUÇÃO</div>
                <div class="num">${active}</div>
                <div class="trend">atendimento/deslocamento</div>
            </div>
            <div class="kpi">
                <div class="label">PENDÊNCIAS</div>
                <div class="num">${pending}</div>
                <div class="trend">exigem ação</div>
            </div>
        </div>
        <div class="grid2">
            <div class="panel">
                <h3>Distribuição atual da equipe</h3>
                ${typeof window.U_TECHS !== 'undefined' ? Object.entries(window.U_TECHS).map(([k, x]) => {
                    const js = typeof window.uOrdersForTech === 'function' ? window.uOrdersForTech(k) : [];
                    return `
                        <div class="list-card">
                            <div>
                                <b>${x.name}</b>
                                <p>${x.state}<br>${x.location}<br>${js.map(j => `${j.id} ${(typeof window.uClient === 'function' ? window.uClient(j) : {}).name || ''}`).join(" • ")}</p>
                            </div>
                            <b>${js.length} OS</b>
                        </div>`;
                }).join("") : '<p>Carregando equipe...</p>'}
            </div>
            <div class="panel">
                <h3>Próximos atendimentos</h3>
                ${rows.map(x => `
                    <div class="list-card">
                        <div>
                            <b>${x.o.time} -${x.c.name}</b>
                            <p>${x.o.id} -${x.tech.name}</p>
                        </div>
                        <span class="badge ${typeof window.uStatusClass === 'function' ? window.uStatusClass(x.o.status) : ''}">${x.o.status}</span>
                    </div>`).join("")}
            </div>
        </div>`;
}