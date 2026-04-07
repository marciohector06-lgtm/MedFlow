const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PacienteService {
  async listar(cpf, pagina = 1, limite = 10) {
    const pular = (Number(pagina) - 1) * Number(limite);
    
    const pacientes = await prisma.paciente.findMany({
      where: cpf ? { cpf } : {},
      skip: pular,
      take: Number(limite),
    });

    const totalRegistros = await prisma.paciente.count({
      where: cpf ? { cpf } : {}
    });

    return {
      dados: pacientes,
      paginaAtual: Number(pagina),
      totalPaginas: Math.ceil(totalRegistros / Number(limite)),
      totalRegistros
    };
  }

  async criar(dados) {
    // Validação de CPF antes de tentar salvar
    if (!dados.nome || !dados.cpf || !dados.telefone) {
      throw new Error('Faltam dados! Nome, CPF e telefone são obrigatórios.');
    }
    if (dados.cpf.length !== 11) {
      throw new Error('CPF inválido! Digite apenas os 11 números.');
    }

    // Cria o paciente no banco
    return await prisma.paciente.create({
      data: {
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        cep: dados.cep,
        endereco: dados.endereco
      }
    });
  }
}

module.exports = new PacienteService();