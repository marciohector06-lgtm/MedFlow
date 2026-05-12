const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função auxiliar para calcular a idade
const calcularIdade = (dataNascimento) => {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

class PacienteService {
  
  // Função listar totalmente restaurada!
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
    if (!dados.nome || !dados.cpf || !dados.telefone || !dados.data_nascimento) {
      throw new Error('Faltam dados! Nome, CPF, telefone e data de nascimento são obrigatórios.');
    }
    if (dados.cpf.length !== 11) {
      throw new Error('CPF inválido! Digite apenas os 11 números.');
    }

    const idade = calcularIdade(dados.data_nascimento);

    // RN-001 e RN-002: Validação de vulneráveis
    if (idade < 18) {
      if (!dados.responsavel_legal || !dados.nome_mae) {
        throw new Error('Menores de 18 anos precisam de Responsável Legal e Nome da Mãe cadastrados.');
      }
    } else if (idade >= 60) {
      if (!dados.responsavel_legal) {
        throw new Error('Pacientes com 60 anos ou mais precisam de um Responsável Legal cadastrado.');
      }
    }

    return await prisma.paciente.create({
      data: {
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        data_nascimento: new Date(dados.data_nascimento), 
        responsavel_legal: dados.responsavel_legal,
        nome_mae: dados.nome_mae,
        cep: dados.cep,
        endereco: dados.endereco
      }
    });
  }
}

module.exports = new PacienteService();