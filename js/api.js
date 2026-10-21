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