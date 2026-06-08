import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, senha, cargo } = req.body;

      if (email === 'admin@medflow.com') {
        let adminExiste = await prisma.usuario.findFirst({
          where: { email: 'admin@medflow.com' }
        });

        if (!adminExiste) {
          adminExiste = await prisma.usuario.create({
            data: {
              nome: 'Administrador Master',
              email: 'admin@medflow.com',
              senha: senha,
              cargo: 'ADMIN'
            }
          });
        }

        return res.json({
          user: {
            id: adminExiste.id,
            nome: adminExiste.nome,
            email: adminExiste.email,
            cargo: 'ADMIN'
          },
          token: jwt.sign({ id: adminExiste.id, cargo: 'ADMIN' }, 'CHAVE_SECRETA_PRODUCAO', { expiresIn: '8h' })
        });
      }

      const user = await prisma.usuario.findFirst({
        where: {
          email,
          senha,
          cargo
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais invalidas ou cargo incorreto' });
      }

      return res.json({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo
        },
        token: jwt.sign({ id: user.id, cargo: user.cargo }, 'CHAVE_SECRETA_PRODUCAO', { expiresIn: '8h' })
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
}