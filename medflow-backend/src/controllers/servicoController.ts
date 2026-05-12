import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServicoController {
  async listar(req: Request, res: Response) {
    try {
      const servicos = await prisma.servico.findMany();
      return res.json(servicos);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar serviços' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { nome, valor, categoria, descricao } = req.body;
      const servico = await prisma.servico.create({
        data: { nome, valor: parseFloat(valor), categoria, descricao }
      });
      return res.json(servico);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao cadastrar serviço' });
    }
  }
}