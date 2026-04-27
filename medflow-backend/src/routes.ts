import { Router } from 'express';
import { AtendimentoController } from './controllers/AtendimentoController';
import { PrismaClient } from '@prisma/client';

const router = Router();
const atendimentoController = new AtendimentoController();
const prisma = new PrismaClient();

router.get('/atendimentos', atendimentoController.listar);
router.post('/atendimentos', atendimentoController.criar);

router.get('/gerar-teste', async (req, res) => {
  try {
    const paciente = await prisma.paciente.create({
      data: {
        nome: "Paciente de Teste",
        cpf: "111.222.333-44",
        data_nascimento: new Date("1990-01-01T00:00:00Z"),
        sexo: "M",
        whatsapp: "61988887777",
        cep: "71020-000",
        endereco: "QE 30 Conjunto A",
        numero: "10",
        bairro: "Guará II",
        cidade: "Brasília",
        uf: "DF"
      }
    });

    const atendimento = await prisma.atendimento.create({
      data: {
        pacienteId: paciente.id,
        status: "AGUARDANDO",
        prioridade: "NORMAL"
      }
    });

    req.app.get('io').emit('atualizaKanban');

    return res.json({ 
      mensagem: "Golaço! Paciente e Atendimento criados com sucesso no banco!", 
      paciente, 
      atendimento 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Deu ruim ao gerar o teste. Será que esse CPF já existe no banco?" });
  }
});

export { router };