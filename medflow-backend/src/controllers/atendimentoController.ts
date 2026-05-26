import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { whatsappQueue } from '../services/whatsappService';

const prisma = new PrismaClient();

export class AtendimentoController {
  async listar(req: Request, res: Response) {
    try {
      const atendimentos = await prisma.atendimento.findMany({
        include: { paciente: true, servico: true, exames: true },
        orderBy: { createdAt: 'asc' }
      });
      return res.json(atendimentos);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar atendimentos' });
    }
  }

  async buscarCpf(req: Request, res: Response) {
    try {
      const { cpf } = req.params;
      const paciente = await prisma.paciente.findUnique({ where: { cpf } });
      
      if (!paciente) {
        return res.status(404).json({ error: 'Paciente nao encontrado' });
      }
      return res.json(paciente);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao buscar paciente' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { 
        nome, cpf, data_nascimento, sexo, whatsapp, cep, endereco, numero, 
        bairro, cidade, uf, nome_mae, nome_responsavel, cpf_responsavel, 
        parentesco, convenio, numero_guia, servicoId, status 
      } = req.body;

      if (!cpf) {
        return res.status(400).json({ error: 'O CPF e obrigatorio' });
      }

      let paciente = await prisma.paciente.findUnique({ where: { cpf } });

      if (paciente) {
        const atendimentoAberto = await prisma.atendimento.findFirst({
          where: {
            pacienteId: paciente.id,
            status: { in: ['ABERTO', 'AGUARDANDO_TRIAGEM', 'AGENDADO'] }
          }
        });

        if (atendimentoAberto) {
          return res.status(400).json({ error: 'Paciente ja possui atendimento ativo' });
        }

        paciente = await prisma.paciente.update({
          where: { id: paciente.id },
          data: {
            nome: nome || paciente.nome,
            whatsapp: whatsapp || paciente.whatsapp,
            cep: cep || paciente.cep,
            endereco: endereco || paciente.endereco,
            numero: numero || paciente.numero,
            bairro: bairro || paciente.bairro,
            cidade: cidade || paciente.cidade,
            uf: uf || paciente.uf
          }
        });
      } else {
        paciente = await prisma.paciente.create({
          data: { 
            nome, cpf, data_nascimento: data_nascimento ? new Date(data_nascimento) : new Date('1900-01-01'), 
            sexo: sexo || 'N/A', whatsapp: whatsapp || '', cep: cep || '', 
            endereco: endereco || '', numero: numero || '', bairro: bairro || '', 
            cidade: cidade || '', uf: uf || '', nome_mae: nome_mae || '', 
            nome_responsavel: nome_responsavel || '', cpf_responsavel: cpf_responsavel || '', 
            parentesco: parentesco || '' 
          }
        });
      }

      const atendimento = await prisma.atendimento.create({
        data: {
          pacienteId: paciente.id,
          convenio: convenio || 'PARTICULAR',
          numero_guia,
          status: status || 'AGENDADO',
          servicoId: servicoId || null
        },
        include: { paciente: true }
      });

      req.app.get('io').emit('atualizar_fila');

      if (paciente.whatsapp) {
        whatsappQueue.adicionar(paciente.whatsapp, 'agendamento_confirmado', [paciente.nome]);
      }

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
        data: { status, sintomas, diagnostico, prescricao },
        include: { paciente: true }
      });

      req.app.get('io').emit('atualizar_fila');

      if (status === 'AGUARDANDO_RETORNO' && atendimento.paciente?.whatsapp) {
        whatsappQueue.adicionar(atendimento.paciente.whatsapp, 'exames_finalizados', [atendimento.paciente.nome]);
      }

      return res.json(atendimento);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao atualizar status' });
    }
  }

  async solicitarExame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { categoria, exame, prioridade, justificativa, observacoes } = req.body;

      const novoExame = await prisma.exame.create({
        data: { atendimentoId: id, categoria, exame, prioridade, justificativa, observacoes }
      });

      req.app.get('io').emit('novo_exame_sadt');

      return res.status(201).json(novoExame);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao solicitar exame' });
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.atendimento.delete({ where: { id } });
      req.app.get('io').emit('atualizar_fila');
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao deletar atendimento' });
    }
  }
}