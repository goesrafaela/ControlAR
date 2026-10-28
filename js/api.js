// api.js - Centralizador de chamadas à API
import { API_BASE_URL } from './config.js';

export async function getUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const result = await response.json();
        return result;
    } catch (err) {
        console.error('Erro ao buscar usuários na API:', err);
        return { success: false, data: [] };
    }
}

export async function getAdminDashboardOrders() {
    try {
        const url = `${API_BASE_URL}/api/admin/dashboard-orders`;

        const response = await fetch(url);

        if (!response.ok) throw new Error('Falha ao buscar ordens de serviço');
        const result = await response.json();
    
        return result;
    } catch (err) {
        console.error('Erro ao buscar ordens de serviço para o dashboard:', err);
        return [];
    }
}

export async function createOrder(novaOS) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/os`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaOS)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Falha ao criar ordem de serviço');
        }

        return { success: true, data: result };
    } catch (err) {
        console.error('Erro ao enviar nova OS para a API:', err);
        return { success: false, message: err.message };
    }
}

export async function createClient(dadosCliente) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCliente)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Falha ao cadastrar cliente');
        }

        return { success: true, data: result };
    } catch (err) {
        console.error('Erro ao enviar novo cliente para a API:', err);
        return { success: false, message: err.message };
    }
}

export async function getEquipments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/equipments`);
        const result = await response.json();
        return result;
    } catch (err) {
        console.error('Erro ao buscar equipamentos na API:', err);
        return { success: false, data: [] };
    }
}
