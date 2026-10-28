// adminDashboard.js - Lógica e renderização do Dashboard Admin
import { getAdminDashboardOrders, createOrder } from './api.js';

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

export async function saveOS() {
    const form = document.getElementById('form-os');
    
    const novaOS = {
        cliente_nome: document.getElementById('osClient')?.value || '',
        servico: document.getElementById('osService')?.value || '',
        data: document.getElementById('osDate')?.value || '',
        time: document.getElementById('osTime')?.value && document.getElementById('osDate')?.value 
            ? `${document.getElementById('osDate').value}T${document.getElementById('osTime').value}:00.000Z` 
            : new Date().toISOString(),
        tecnico_id: document.getElementById('osTech')?.value || '',
        status: document.getElementById('osStatus')?.value || 'Pendente',
        observacoes: document.getElementById('osNotes')?.value || ''
    };

    const resultado = await createOrder(novaOS);

    if (resultado.success) {
        const modal = document.getElementById('osModal');
        if (modal) modal.classList.remove('open');
        if (form) form.reset();

        await loadAdminDashboardData();
        console.log("Nova OS criada e salva com sucesso!");
    } else {
        alert(resultado.message || "Não foi possível salvar a OS.");
    }
}

async function saveClient() {
    const nome_razao_social = document.getElementById("cName").value.trim();
    const telefone = document.getElementById("cPhone").value.trim();
    const tipo = document.getElementById("cType").value;
    
    if (!nome_razao_social) {
        showToast("Informe o nome do cliente.");
        return;
    }

    try {
        const response = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_razao_social, telefone, tipo })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao cadastrar cliente');
        }

        closeModal("clientModal");
        
        // Limpa os campos
        document.getElementById("cName").value = '';
        document.getElementById("cPhone").value = '';
        
        showToast("Cliente cadastrado com sucesso no banco de dados!");
        
        // Recarrega a lista de clientes do servidor se houver função de listagem
        if (typeof carregarClientes === 'function') {
            carregarClientes();
        }
    } catch (error) {
        console.error("Erro:", error);
        showToast(error.message || "Erro ao salvar cliente.");
    }
}

async function renderClients() {
    try {
        // 1. Busca os clientes reais direto do back-end
        const response = await fetch('/api/clients');
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao carregar clientes');
        }

        const clientsList = result.data || [];

        // 2. Pega o valor do input de pesquisa para filtrar em tempo real
        const searchEl = document.getElementById("clientSearch");
        const q = (searchEl ? searchEl.value : "").toLowerCase();

        // 3. Filtra os dados que vieram do banco
        const filtered = clientsList.filter(c => {
            const textoCompleto = `${c.nome_razao_social || ''} ${c.telefone || ''} ${c.tipo || ''}`.toLowerCase();
            return textoCompleto.includes(q);
        });

        // 4. Monta as linhas da tabela respeitando os nomes reais das colunas do banco
        const rows = filtered.map(c => `
            <tr>
                <td><b>${c.nome_razao_social}</b><br><small>${c.cidade || ''}</small></td>
                <td>${c.telefone || "-"}</td>
                <td><span class="badge info">${c.tipo || 'Residencial'}</span></td>
                <td>${c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '-'}</td>
                <td>-</td>
            </tr>
        `).join("");

        // 5. Insere na tabela do HTML
        const clientsBodyEl = document.getElementById("clientsBody");
        if (clientsBodyEl) {
            clientsBodyEl.innerHTML = rows || `<tr><td colspan="5">Nenhum cliente encontrado.</td></tr>`;
        }

    } catch (error) {
        console.error("Erro ao renderizar clientes:", error);
    }
}

 async function renderAll() {
    // 1. Garante que a data atual só é aplicada se o elemento existir na tela
    const todayEl = document.getElementById("todayText");
    if (todayEl) {
        const now = new Date();
        todayEl.textContent = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    }

    try {
        // 2. Busca os dados atualizados de clientes, OS e equipamentos do MySQL em paralelo
        const [resClients, resOS, resEquip] = await Promise.all([
            fetch('/api/clients').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/admin/os').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/equipments').then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        const clientsList = resClients.data || [];
        const ordersList = resOS.data || [];
        const equipmentList = resEquip.data || [];

        // 3. Função de renderização e busca de clientes (disponível globalmente para o input)
        window.renderClients = function() {
            const searchEl = document.getElementById("clientSearch");
            const q = (searchEl ? searchEl.value : "").toLowerCase();
            
            const filtered = clientsList.filter(c => {
                const searchable = `${c.nome_razao_social || ''} ${c.telefone || ''} ${c.cidade || ''} ${c.tipo || ''}`.toLowerCase();
                return searchable.includes(q);
            });

            const rows = filtered.map(c => `
                <tr>
                    <td><b>${c.nome_razao_social || ''}</b><br><small>${c.cidade || ''}</small></td>
                    <td>${c.telefone || "-"}</td>
                    <td><span class="badge info">${c.tipo || 'Residencial'}</span></td>
                    <td>${c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>${c.proxima_revisao ? new Date(c.proxima_revisao).toLocaleDateString('pt-BR') : '-'}</td>
                </tr>
            `).join("");
            
            const clientsBodyEl = document.getElementById("clientsBody");
            if (clientsBodyEl) {
                clientsBodyEl.innerHTML = rows || `<tr><td colspan="5">Nenhum cliente encontrado.</td></tr>`;
            }
        };
        window.renderClients();

        // 4. KPI Clientes
        const kpiClientsEl = document.getElementById("kpiClients");
        if (kpiClientsEl) {
            kpiClientsEl.textContent = clientsList.length;
        }

        // 5. KPI Chamados Abertos (diferentes de Concluída)
        const kpiOpenEl = document.getElementById("kpiOpen");
        if (kpiOpenEl) {
            const openOrders = ordersList.filter(o => !o.status || !o.status.toLowerCase().includes('concluída'));
            kpiOpenEl.textContent = openOrders.length;
        }

        // 6. Atendimentos de hoje e timeline
        const todayDateStr = new Date().toISOString().split('T')[0];
        const todays = ordersList.filter(o => {
            if (!o.inicio_atendimento) return false;
            return o.inicio_atendimento.startsWith(todayDateStr);
        });

        const kpiTodayEl = document.getElementById("kpiToday");
        if (kpiTodayEl) {
            kpiTodayEl.textContent = todays.length;
        }

        const timelineEl = document.getElementById("timeline");
        if (timelineEl) {
            timelineEl.innerHTML = todays.map(o => `
                <div class="event">
                    <b>${o.inicio_atendimento ? new Date(o.inicio_atendimento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '--:--'} — ${o.cliente_nome || 'Cliente'}</b>
                    <span>${o.tipo_servico || 'Serviço'} | ${o.status || 'ABERTA'}</span>
                </div>
            `).join("") || "<p>Sem atendimentos para hoje.</p>";
        }

        // 7. Alertas de revisão
        const alerts = clientsList.filter(c => c.proxima_revisao).sort((a, b) => a.proxima_revisao.localeCompare(b.proxima_revisao));

        const kpiDueEl = document.getElementById("kpiDue");
        if (kpiDueEl) {
            kpiDueEl.textContent = alerts.length;
        }

        const dashboardAlertsEl = document.getElementById("dashboardAlerts");
        if (dashboardAlertsEl) {
            dashboardAlertsEl.innerHTML = alerts.slice(0, 3).map((c, i) => `
                <div class="alert-box ${i < 2 ? "danger" : "warn"}">
                    <b>${c.nome_razao_social}</b><br>
                    <small>Revisão prevista: ${c.proxima_revisao ? new Date(c.proxima_revisao).toLocaleDateString('pt-BR') : '-'}</small>
                </div>
            `).join("");
        }

        const allAlertsEl = document.getElementById("allAlerts");
        if (allAlertsEl) {
            allAlertsEl.innerHTML = alerts.map(c => `
                <div class="list-card">
                    <div>
                        <b>${c.nome_razao_social}</b>
                        <p>${c.tipo || ''} ${c.cidade || ''} revisão em ${c.proxima_revisao ? new Date(c.proxima_revisao).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                    <button class="btn btn-primary" onclick="prefillOS('${c.nome_razao_social.replaceAll("'", "\\'")}')">Gerar OS</button>
                </div>
            `).join("");
        }

        // 8. Listas gerais (Agenda, Ordens de Serviço)
        const agendaListEl = document.getElementById("agendaList");
        if (agendaListEl) {
            agendaListEl.innerHTML = ordersList.slice().sort((a, b) => {
                const dateA = a.inicio_atendimento || '';
                const dateB = b.inicio_atendimento || '';
                return dateA.localeCompare(dateB);
            }).map(o => `
                <div class="list-card">
                    <div>
                        <b>${o.inicio_atendimento ? new Date(o.inicio_atendimento).toLocaleString('pt-BR') : 'Data não informada'} — ${o.cliente_nome || 'Cliente'}</b>
                        <p>${o.tipo_servico || 'Serviço'} (${o.status || 'ABERTA'})</p>
                    </div>
                    <span class="badge info">${o.status || 'ABERTA'}</span>
                </div>
            `).join("") || "<p>Nenhum agendamento encontrado.</p>";
        }

        const osListEl = document.getElementById("osList");
        if (osListEl) {
            osListEl.innerHTML = ordersList.slice().reverse().map(o => `
                <div class="list-card">
                    <div>
                        <b>${o.numero || 'OS'} — ${o.cliente_nome || 'Cliente'}</b>
                        <p>${o.tipo_servico || 'Serviço'} | ${o.inicio_atendimento ? new Date(o.inicio_atendimento).toLocaleString('pt-BR') : ''}</p>
                    </div>
                    <span class="badge info">${o.status || 'ABERTA'}</span>
                </div>
            `).join("") || "<p>Nenhuma ordem de serviço encontrada.</p>";
        }

        // 9. Renderização dos Equipamentos reais usando as colunas da tabela
        const equipmentListEl = document.getElementById("equipmentList");
        if (equipmentListEl) {
            equipmentListEl.innerHTML = equipmentList.map(e => `
                <div class="list-card">
                    <div>
                        <b>${e.tipo || 'Equipamento'} — ${e.marca || ''} ${e.modelo || ''}</b>
                        <p>${e.cliente_nome || 'Cliente'} | Ambiente: ${e.ambiente || 'Não informado'} • ${e.capacidade_btu ? e.capacidade_btu + ' BTU • ' : ''}Série: ${e.numero_serie || '-'}</p>
                    </div>
                    <span class="badge ok">${e.status || 'Ativo'}</span>
                </div>
            `).join("") || "<p>Nenhum equipamento cadastrado no sistema.</p>";
        }

    } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
    }
};

export const salvarNovaOS = saveOS;

window.saveOS = saveOS;
window.salvarNovaOS = salvarNovaOS;
window.uOrdersForTech = uOrdersForTech;
window.saveClient = saveClient;
window.renderClients = renderClients;
window.renderAll = renderAll;