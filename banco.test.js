const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Testes de Infraestrutura (Banco + Prisma)', () => {
  
  // Quando todos os testes acabarem, desliga o motor do Prisma
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve conseguir conectar, criar um paciente temporário e depois apagar', async () => {
    // Gerando um CPF falso aleatório para não dar erro de "CPF já existe" se você rodar o teste 2 vezes
    const cpfFalso = Date.now().toString().substring(0, 11);

    // 1. AÇÃO: Manda o banco criar o paciente
    const novoPaciente = await prisma.paciente.create({
      data: {
        nome: 'Paciente Teste Automatizado',
        cpf: cpfFalso,
        telefone: '999999999',
      }
    });

    // 2. PROVA: O Jest verifica se o banco devolveu um ID (ou seja, se salvou de verdade)
    expect(novoPaciente).toHaveProperty('id');
    expect(novoPaciente.nome).toBe('Paciente Teste Automatizado');

    // 3. FAXINA: Deleta o paciente de teste para não sujar o seu banco de dados
    const pacienteDeletado = await prisma.paciente.delete({
      where: { id: novoPaciente.id }
    });

    // Confirma se apagou mesmo
    expect(pacienteDeletado.id).toBe(novoPaciente.id);
  });
});