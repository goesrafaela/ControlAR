// api.js - Centralizador de chamadas à API
import { API_BASE_URL } from './config';

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