// adminDashboard.js - Lógica e renderização do Dashboard Admin
import { getAdminDashboardOrders } from './api.js';

export async function loadAdminDashboardData() {
    try {
        const data = await getAdminDashboardOrders();

        if (Array.isArray(data) && data.length > 0) {
            window.U_ORDERS = data.map(item => {
                const techId = item.tecnico_id || item.techKey || 0;
                return {
                    id: item.id,
                    time: item.time,
                    status: item.status,
                    techKey: `tecnico_${techId}`, 
                    cliente: { 
                        id: item.cliente_id, 
                        name: item.cliente_nome || item.cliente_name || 'Cliente' 
                    },
                    tech: { 
                        id: techId, 
                        name: item.tecnico_nome || item.tecnico_name || 'Não atribuído' 
                    }
                };
            });
        }
        
        try {
            const response = await fetch('/api/admin/tecnicos-login');
            const tecnicos = await response.json();
            
            if (Array.isArray(tecnicos)) {
                window.U_TECHS = {};
                tecnicos.forEach(tech => {
                    const key = `tecnico_${tech.tecnico_id}`;
                    window.U_TECHS[key] = {
                        name: tech.nome,
                        state: tech.status_operacional || 'Disponível',
                        location: tech.localizacao_texto || tech.especialidade || 'Geral'
                    };
                });
            }
        } catch (err) {
            console.warn("Não foi possível carregar U_TECHS via API.", err);
        }

        renderAdminDashboardUnified();
        
        if (typeof renderOpsJobsUnified === 'function') {
            renderOpsJobsUnified();
        }

        if (typeof renderUnifiedTechnician === 'function') {
            renderUnifiedTechnician();
        }
        
    } catch (err) {
        console.error("Erro ao carregar dados do dashboard admin:", err);
    }
}

// 2. Auxiliar para preparar as linhas unificadas de ordens, clientes e técnicos
function adminUnifiedRows() {
    const orders = window.U_ORDERS || [];
    return orders.slice().sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(o => ({
        o,
        c: o.cliente || { id: '', name: 'Cliente' },
        tech: o.tech || { name: 'Técnico' }
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

export function uOrdersForTech(key) {
    const listaOrdens = window.U_ORDERS || [];
    return listaOrdens.filter(o => o.techKey === key).sort((a, b) => a.time.localeCompare(b.time));
}

window.uOrdersForTech = uOrdersForTech;