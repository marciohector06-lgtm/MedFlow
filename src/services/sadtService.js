const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SadtService {
  async solicitarExame(dados) {
    if (!dados.atendimento_id || !dados.nome_exame) {
      throw new Error('O ID do atendimento e o nome do exame são obrigatórios.');
    }

    // Cria a solicitação de exame atrelada ao atendimento
    return await prisma.sadt.create({
      data: {
        atendimento_id: Number(dados.atendimento_id),
        nome_exame: dados.nome_exame,
        observacoes: dados.observacoes || null,
        status: 'SOLICITADO' // Status inicial padrão
      }
    });
  }

  async listarExamesPorAtendimento(atendimentoId) {
    return await prisma.sadt.findMany({
      where: {
        atendimento_id: Number(atendimentoId)
      },
      orderBy: {
        criado_em: 'desc'
      }
    });
  }

  async atualizarStatusExame(id, novoStatus) {
    const statusValidos = ['SOLICITADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
    
    if (!statusValidos.includes(novoStatus)) {
      throw new Error('Status de exame inválido.');
    }

    return await prisma.sadt.update({
      where: { id: Number(id) },
      data: { status: novoStatus }
    });
  }
}

module.exports = new SadtService();