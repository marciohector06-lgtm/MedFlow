const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API do MedFlow rodando 100%!' });
});

// --- PACIENTES ---
app.post('/pacientes', async (req, res) => {
  try {
    const { nome, cpf, telefone } = req.body;
    
    // Regra: Sem campo vazio ou só com espaços
    if (!nome || nome.trim() === "") return res.status(400).json({ erro: 'NOME_OBRIGATORIO' });
    if (!cpf || cpf.trim().length !== 11) return res.status(400).json({ erro: 'CPF_INVALIDO' });
    if (!telefone || telefone.trim() === "") return res.status(400).json({ erro: 'TELEFONE_OBRIGATORIO' });
    
    const novoPaciente = await prisma.paciente.create({
      data: { nome: nome.trim(), cpf: cpf.trim(), telefone: telefone.trim() }
    });
    res.status(201).json(novoPaciente);
  } catch (erro) {
    res.status(500).json({ erro: 'ERRO_AO_CADASTRAR_PACIENTE' });
  }
});

app.get('/pacientes', async (req, res) => {
  try {
    const { cpf, pagina = 1, limite = 10 } = req.query;
    const pag = Number(pagina);
    const lim = Number(limite);
    const pular = (pag - 1) * lim;
    
    const pacientes = await prisma.paciente.findMany({
      where: cpf ? { cpf: cpf } : {},
      skip: pular,
      take: lim,
    });
    
    const totalRegistros = await prisma.paciente.count({
      where: cpf ? { cpf: cpf } : {}
    });
    
    res.json({
      dados: pacientes,
      paginaAtual: pag,
      totalPaginas: Math.ceil(totalRegistros / lim),
      totalRegistros: totalRegistros
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
  }
});

// --- ATENDIMENTOS ---
app.post('/atendimentos', async (req, res) => {
  try {
    const { tipo, paciente_id, procedimento_id, numero_guia, convenio } = req.body;

    // Travas de segurança essenciais
    if (!paciente_id) return res.status(400).json({ erro: 'PACIENTE_ID_OBRIGATORIO' });
    if (!procedimento_id) return res.status(400).json({ erro: 'PROCEDIMENTO_ID_OBRIGATORIO' });
    if (!convenio || convenio.trim() === "") return res.status(400).json({ erro: 'CONVENIO_OBRIGATORIO' });

    // Regra de Negócio Sênior: Se não for Particular, a Guia/Carteirinha é obrigatória
    if (convenio.toUpperCase() !== 'PARTICULAR') {
      if (!numero_guia || numero_guia.trim() === "") {
        return res.status(400).json({ erro: 'NUMERO_GUIA_OBRIGATORIO_PARA_CONVENIO' });
      }
    }

    const novoAtendimento = await prisma.atendimento.create({
      data: {
        tipo,
        paciente_id,
        procedimento_id,
        numero_guia: numero_guia ? numero_guia.trim() : null,
        convenio: convenio.trim().toUpperCase(),
        status: 'AGUARDANDO'
      }
    });
    res.status(201).json(novoAtendimento);
  } catch (erro) {
    res.status(500).json({ erro: 'ERRO_AO_CRIAR_ATENDIMENTO' });
  }
});

app.get('/atendimentos', async (req, res) => {
  try {
    const { status, pagina = 1, limite = 10 } = req.query;
    const pag = Number(pagina);
    const lim = Number(limite);
    const pular = (pag - 1) * lim;

    const atendimentos = await prisma.atendimento.findMany({
      where: status ? { status: status } : {},
      skip: pular,
      take: lim,
      include: {
        paciente: true,
        procedimento: true
      }
    });

    const totalRegistros = await prisma.atendimento.count({
      where: status ? { status: status } : {}
    });

    res.json({
      dados: atendimentos,
      paginaAtual: pag,
      totalPaginas: Math.ceil(totalRegistros / lim),
      totalRegistros: totalRegistros
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar atendimentos.' });
  }
});

// --- FILA AUTOMÁTICA ---
app.put('/atendimentos/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.atendimento.update({
      where: { id: parseInt(id) },
      data: { status: 'FINALIZADO' }
    });

    const filaAguardando = await prisma.atendimento.findMany({
      where: { status: 'AGUARDANDO' },
      orderBy: { id: 'asc' }, 
      include: { paciente: true } 
    });

    if (filaAguardando.length > 0) {
      const proximo = filaAguardando[0];
      await prisma.atendimento.update({
        where: { id: proximo.id },
        data: { status: 'CHAMADO' }
      });
      
      console.log(`[SISTEMA] 📺 Paciente ${proximo.paciente.nome} CHAMADO!`);

      for (let i = 1; i < filaAguardando.length; i++) {
        const pacienteEspera = filaAguardando[i];
        console.log(`[ZAP] 📱 -> ${pacienteEspera.paciente.telefone}: Faltam ${i} pessoas.`);
      }
    }

    res.status(200).json({ mensagem: "OK" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro na atualização da fila." });
  }
});

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor MedFlow rodando em http://localhost:${PORTA}`);
});