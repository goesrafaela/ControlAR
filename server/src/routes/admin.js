const express = require('express');
const router = express.Router();

const db = require('../db');

router.get('/dashboard-orders', async (req, res) => {
    try {
        const query = `
            SELECT 
                os.id,
                a.inicio AS time,
                os.status,
                os.tecnico_id AS techKey,
                c.id AS cliente_id,
                c.nome_razao_social AS cliente_nome,
                t.id AS tecnico_id,
                u.nome AS tecnico_nome
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            LEFT JOIN tecnicos t ON os.tecnico_id = t.id
            LEFT JOIN usuarios u ON t.usuario_id = u.id
            LEFT JOIN agendamentos a ON os.agendamento_id = a.id
            ORDER BY a.inicio ASC
        `;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar OS para o dashboard:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

router.get('/tecnicos-login', async (req, res) => {
    try {
        const query = `
            SELECT 
                t.id AS tecnico_id,
                t.telefone,
                t.especialidade,
                t.localizacao_texto,
                t.status_operacional,
                t.ativo AS tecnico_ativo,
                u.id AS usuario_id,
                u.nome,
                u.email,
                u.perfil
            FROM tecnicos t
            INNER JOIN usuarios u ON t.usuario_id = u.id
            WHERE t.ativo = 1 AND u.ativo = 1
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar técnicos para login:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

router.post('/os', async (req, res) => {
    try {
        let { cliente_nome, servico, data, time, tecnico_id, status, observacoes } = req.body;
        
        if (!cliente_nome) {
            return res.status(400).json({ success: false, message: "O nome do cliente é obrigatório." });
        }

        // 1. Verifica se o cliente existe pelo nome/razão social
        let [clientesExistentes] = await db.query(
            'SELECT id FROM clientes WHERE nome_razao_social = ? LIMIT 1', 
            [cliente_nome]
        );

        if (clientesExistentes.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `O cliente "${cliente_nome}" não está cadastrado. Por favor, cadastre-o na tela de Clientes antes de abrir a OS.` 
            });
        }

        let clienteId = clientesExistentes[0].id;

        // 2. Gera um número único para a OS
        const numeroOS = `OS-${Date.now().toString().slice(-6)}`;

        // Mapeia o status para um dos ENUMs aceitos pelo banco
        let statusBanco = 'ABERTA';
        if (status && /agenda/i.test(status)) statusBanco = 'AGENDADA';
        else if (status && /andamento/i.test(status)) statusBanco = 'EM_ATENDIMENTO';
        else if (status && /conclu/i.test(status)) statusBanco = 'CONCLUIDA';

        // Trata a data e hora corretamente
        let inicioAtendimento = null;
        if (data && time) {
            // Se o 'time' já vier com hora tratada, pega só o horário limpo
            const horaLimpa = time.includes('T') ? time.split('T')[1].substring(0, 8) : time;
            inicioAtendimento = `${data} ${horaLimpa.length === 5 ? horaLimpa + ':00' : horaLimpa}`;
        } else if (data) {
            inicioAtendimento = `${data} 00:00:00`;
        }

        // Garante que o tecnico_id seja um número válido ou null (evita enviar strings como 'Técnico 01')
        let tecnicoIdNumerico = null;
        if (tecnico_id && !isNaN(tecnico_id)) {
            tecnicoIdNumerico = parseInt(tecnico_id, 10);
        }

        // 3. Insere na tabela ordens_servico
        const queryOS = `
            INSERT INTO ordens_servico (
                numero,
                cliente_id,
                tipo_servico,
                descricao_problema,
                prioridade,
                status,
                inicio_atendimento,
                tecnico_id
            ) 
            VALUES (?, ?, ?, ?, 'NORMAL', ?, ?, ?)
        `;
        
        await db.query(queryOS, [
            numeroOS,
            clienteId,
            servico || 'Manutenção Geral',
            observacoes || '',
            statusBanco,
            inicioAtendimento,
            tecnicoIdNumerico
        ]);
        
        return res.status(201).json({ success: true, message: "OS salva com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar OS no banco:", error);
        return res.status(500).json({ success: false, message: "Erro interno no servidor ao salvar OS." });
    }
});

// GET /api/admin/os - Listar todas as ordens de serviço
router.get('/os', async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT 
                os.id,
                os.numero,
                os.tipo_servico,
                os.status,
                os.prioridade,
                os.inicio_atendimento,
                os.valor_total,
                c.nome_razao_social AS cliente_nome 
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            ORDER BY os.criado_em DESC
        `);

        return res.status(200).json({
            success: true,
            message: "Ordens de serviço listadas com sucesso",
            data: orders
        });
    } catch (error) {
        console.error("Erro ao buscar ordens de serviço:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno no servidor ao buscar ordens de serviço."
        });
    }
});

module.exports = router;