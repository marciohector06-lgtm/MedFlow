import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProdutoController {
  async listar(req: Request, res: Response) {
    try {
      const produtos = await prisma.produto.findMany();
      return res.json(produtos);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar estoque' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { nome, quantidade, unidade, precoCusto, validade } = req.body;
      const produto = await prisma.produto.create({
        data: {
          nome,
          quantidade: Number(quantidade),
          unidade,
          precoCusto: Number(precoCusto),
          validade: validade ? new Date(validade) : null
        }
      });
      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao cadastrar produto' });
    }
  }

  async baixaAutomatica(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;

      const produto = await prisma.produto.update({
        where: { id },
        data: {
          quantidade: {
            decrement: Number(quantidade || 1)
          }
        }
      });

      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ erro: 'Falha na baixa do estoque via sensor' });
    }
  }
}