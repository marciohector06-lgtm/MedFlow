import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AtendimentoController {
  async listar(req: Request, res: Response) {
    try {
      const atendimentos = await prisma.atendimento.findMany({
        include: { paciente: true },
        orderBy: { hora_chegada: 'asc' }
      });
      return res.json(atendimentos);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao buscar atendimentos' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { nome, cpf, data_nascimento, sexo, whatsapp, cep, endereco, convenio } = req.body;

      const paciente = await prisma.paciente.create({
        data: {
          nome,
          cpf,
          data_nascimento: new Date(data_nascimento),
          sexo,
          whatsapp,
          cep,
          endereco,
          numero: "S/N",
          bairro: "N/A",
          cidade: "Brasília",
          uf: "DF"
        }
      });

      const atendimento = await prisma.atendimento.create({
        data: {
          pacienteId: paciente.id,
          status: "AGUARDANDO",
          prioridade: "NORMAL",
          convenio: convenio || "PARTICULAR"
        }
      });

      req.app.get('io').emit('atualizaKanban');

      return res.json(atendimento);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao cadastrar' });
    }
  }
}