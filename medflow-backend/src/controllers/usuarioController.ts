import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UsuarioController {
  async listar(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, cargo: true, createdAt: true }
      });
      return res.json(usuarios);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { nome, email, senha, cargo } = req.body;
      const usuario = await prisma.usuario.create({
        data: { nome, email, senha, cargo }
      });
      return res.json(usuario);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao cadastrar profissional' });
    }
  }

  async remover(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.usuario.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao remover acesso' });
    }
  }
}