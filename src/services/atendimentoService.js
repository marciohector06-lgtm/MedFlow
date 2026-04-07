const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AtendimentoService {
  async listarAtendimentos(status) {
    return await prisma.atendimento.findMany({
      where: status ? { status } : {},
      include: { paciente: true, procedimento: true }
    });
  }

  async criarAtendimento(dados) {
    // Regra de negócio: todo atendimento novo entra como AGUARDANDO
    return await prisma.atendimento.create({
      data: {
        tipo: dados.tipo,
        prioridade: dados.prioridade || false,
        paciente_id: dados.paciente_id,
        procedimento_id: dados.procedimento_id,
        status: 'AGUARDANDO' 
      }
    });
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