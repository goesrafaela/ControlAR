// ops-dashboard.js - Lógica exclusiva da tela/aba de Operações

export function renderOpsJobsUnified() {
    const el = document.getElementById("opsJobsTable");
    if (!el) return;

    const orders = Array.isArray(window.U_ORDERS) ? window.U_ORDERS : [];
    
    const countEl = document.getElementById("opsJobs");
    if (countEl) countEl.textContent = orders.length;

    el.innerHTML = `
        <div style="overflow:auto">
            <table class="ops-table">
                <thead>
                    <tr>
                        <th>OS</th>
                        <th>Cliente</th>
                        <th>Técnico</th>
                        <th>Horário</th>
                        <th>Status</th>
                        <th>Delegar</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.slice().sort((a,b) => (a.time || '').localeCompare(b.time || '')).map(j => {
                        const clientName = j.cliente?.name || 'Cliente';
                        const clientId = j.cliente?.id || '';
                        const clientEq = j.cliente?.equipment || '';
                        
                        const techData = window.U_TECHS && window.U_TECHS[j.techKey] ? window.U_TECHS[j.techKey] : { name: j.tech?.name || 'Não atribuído' };

                        return `
                            <tr>
                                <td><b>${j.id}</b><div class="ops-client-id">${clientId}</div></td>
                                <td>${clientName}<div class="ops-client-id">${clientEq}</div></td>
                                <td>${techData.name}</td>
                                <td>${j.time || '--:--'}</td>
                                <td><span class="ops-badge">${j.status}</span></td>
                                <td>
                                    <select class="ops-select" onchange="uDelegate('${j.id}', this.value)">
                                        <option value="">Mover para...</option>
                                        ${window.U_TECHS ? Object.entries(window.U_TECHS).filter(([k]) => k !== String(j.techKey)).map(([k, x]) => `<option value="${k}">${x.name}</option>`).join("") : ''}
                                    </select>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>`;
}

window.renderOpsJobsUnified = renderOpsJobsUnified;