import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AtendimentoController {
  async listar(req: Request, res: Response) {
    try {
      const atendimentos = await prisma.atendimento.findMany({
        include: {
          paciente: true,
          servico: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      return res.json(atendimentos);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar atendimentos' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { 
        nome, cpf, data_nascimento, sexo, whatsapp, cep, endereco, numero, 
        bairro, cidade, uf, nome_mae, nome_responsavel, cpf_responsavel, 
        parentesco, convenio, numero_guia, servicoId 
      } = req.body;

      let paciente = await prisma.paciente.findUnique({ where: { cpf } });

      if (!paciente) {
        paciente = await prisma.paciente.create({
          data: { 
            nome, cpf, data_nascimento: new Date(data_nascimento), sexo, 
            whatsapp, cep, endereco, numero, bairro, cidade, uf, 
            nome_mae, nome_responsavel, cpf_responsavel, parentesco 
          }
        });
      }

      const atendimento = await prisma.atendimento.create({
        data: {
          pacienteId: paciente.id,
          convenio,
          numero_guia,
          servicoId: servicoId || null
        },
        include: {
          paciente: true
        }
      });

      return res.json(atendimento);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao criar atendimento' });
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, sintomas, diagnostico, prescricao } = req.body;

      const atendimento = await prisma.atendimento.update({
        where: { id },
        data: { status, sintomas, diagnostico, prescricao }
      });
      return res.json(atendimento);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao atualizar status' });
    }
  }
}