const atendimentoService = require('../services/atendimentoService');

class AtendimentoController {
    async listar(req, res) {
        try {
            const { status } = req.query;
            const atendimentos = await atendimentoService.listarAtendimentos(status);

            // --- INÍCIO DO KANBAN DE TERMINAL (APRESENTAÇÃO) ---
            // Transformamos os dados brutos em algo legível para a tabela
            const kanbanVisual = atendimentos.map(a => ({
                ID: a.id,
                Paciente: a.paciente.nome,
                Procedimento: a.procedimento.nome,
                Prioridade: a.prioridade ? '🔴 ALTA' : '🟢 NORMAL',
                Status: a.status === 'AGUARDANDO' ? '⏳ Aguardando'
                    : a.status === 'EM_ATENDIMENTO' ? '👨‍⚕️ No Consultório'
                        : a.status === 'AUSENTE_AGUARDANDO_RETORNO' ? '⚠️ Ausente (Topo da Fila)'
                            : a.status
            }));

            // Limpa o console e desenha a tabela
            console.clear();
            console.log('\n======================================================');
            console.log('              🏥 KANBAN MEDFLOW (AO VIVO)               ');
            console.log('======================================================\n');

            if (kanbanVisual.length > 0) {
                console.table(kanbanVisual);
            } else {
                console.log(' 📭 Fila vazia no momento. Nenhum paciente aguardando.');
            }
            console.log('\n======================================================\n');
            // --- FIM DO KANBAN DE TERMINAL ---

            res.json(atendimentos);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao buscar atendimentos.' });
        }
    }

    async criar(req, res) {
        try {
            const { tipo, prioridade, paciente_id, procedimento_id } = req.body;
            if (!tipo || !paciente_id || !procedimento_id) {
                return res.status(400).json({ erro: 'Faltam dados obrigatórios.' });
            }

            const novo = await atendimentoService.criarAtendimento(req.body);
            res.status(201).json(novo);
        } catch (erro) {
            res.status(500).json({ erro: 'Erro ao criar atendimento.' });
        }
    }

    async reportarAusencia(req, res) {
        try {
            const { id } = req.params;
            const atualizado = await atendimentoService.marcarComoAusente(id);
            res.json(atualizado);
        } catch (erro) {
            res.status(500).json({ erro: 'Erro ao atualizar status de ausência.' });
        }
    }
}

module.exports = new AtendimentoController();