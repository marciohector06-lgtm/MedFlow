const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsappService = require('./whatsappService'); // Importe o serviço!

class AtendimentoService {
  // ... (mantenha listarAtendimentos e criarAtendimento originais)

  async atualizarStatusKanban(id, novoStatus) {
    const statusValidos = [
      'AGUARDANDO_TRIAGEM', 'EM_TRIAGEM', 'AGUARDANDO_CONSULTA',
      'EM_CONSULTA', 'FINALIZADO', 'AUSENTE_AGUARDANDO_RETORNO'
    ];

    if (!statusValidos.includes(novoStatus)) {
      throw new Error('Status inválido para a máquina de estados do Kanban.');
    }

    // Faz o update e já traz os dados do paciente para podermos notificar
    const atendimentoAtualizado = await prisma.atendimento.update({
      where: { id: Number(id) },
      data: { status: novoStatus },
      include: { paciente: true }
    });

    // RNF-005: Processo Assíncrono - Dispara notificação sem travar a thread
    // Só avisa se o paciente for para a fila de consulta, por exemplo
    if (novoStatus === 'AGUARDANDO_CONSULTA') {
      whatsappService.enviarNotificacaoFila(
        atendimentoAtualizado.paciente.telefone,
        atendimentoAtualizado.paciente.nome,
        'Próximo' // Posição mockada por enquanto
      ).catch(err => console.error('Erro ao enviar WhatsApp:', err));
    }

    return atendimentoAtualizado;
  }

  async marcarComoAusente(id) {
    // Funcionalidade do Doc de Visão: Paciente Ausente
    // Tira da tela do médico e joga pro topo da fila (ex: status REAVALIAR)
    return await prisma.atendimento.update({
      where: { id: Number(id) },
      data: { status: 'AUSENTE_AGUARDANDO_RETORNO' }
    });
  }

}

module.exports = new AtendimentoService();