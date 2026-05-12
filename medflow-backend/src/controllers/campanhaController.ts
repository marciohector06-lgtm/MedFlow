import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { whatsappQueue } from '../services/whatsappService';

const prisma = new PrismaClient();

export class CampanhaController {
  async listar(req: Request, res: Response) {
    const campanhas = await prisma.campanha.findMany();
    return res.json(campanhas);
  }

  async disparar(req: Request, res: Response) {
    try {
      const { nome, tema, mensagem, desconto } = req.body;
      
      const novaCampanha = await prisma.campanha.create({
        data: { nome, tema, mensagem, desconto, status: 'ENVIADA' }
      });

      const pacientes = await prisma.paciente.findMany();
      
      pacientes.forEach(p => {
        if (p.whatsapp) {
          const msgPersonalizada = `Olá ${p.nome}! 🩺\n\n${mensagem}\n\n${desconto ? `Use o cupom: ${desconto}` : ''}`;
          whatsappQueue.adicionar(p.whatsapp, msgPersonalizada);
        }
      });

      return res.json(novaCampanha);
    } catch (error) {
      return res.status(500).json({ erro: 'Falha no disparo da campanha' });
    }
  }
}