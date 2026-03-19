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
app.get('/pacientes', async (req, res) => {
  try {
    const { cpf } = req.query;
    const pacientes = await prisma.paciente.findMany({
      where: cpf ? { cpf: cpf } : {},
    });
    res.json(pacientes);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
  }
});

app.post('/pacientes', async (req, res) => {
  try {
    const { nome, cpf, telefone } = req.body;
    const novoPaciente = await prisma.paciente.create({
      data: { nome, cpf, telefone }
    });
    res.status(201).json(novoPaciente);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar. CPF duplicado?' });
  }
});

// --- PROCEDIMENTOS ---
app.post('/procedimentos', async (req, res) => {
  try {
    const { nome, tempo_estimado } = req.body;
    const novoProcedimento = await prisma.procedimento.create({
      data: { nome, tempo_estimado }
    });
    res.status(201).json(novoProcedimento);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar procedimento.' });
  }
});

// --- ATENDIMENTOS ---
app.get('/atendimentos', async (req, res) => {
  try {
    const { status } = req.query;
    const atendimentos = await prisma.atendimento.findMany({
      where: status ? { status: status } : {},
      include: {
        paciente: true,
        procedimento: true
      }
    });
    res.json(atendimentos);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar atendimentos.' });
  }
});

app.post('/atendimentos', async (req, res) => {
  try {
    const { tipo, prioridade, paciente_id, procedimento_id } = req.body;
    const novoAtendimento = await prisma.atendimento.create({
      data: {
        tipo,
        prioridade: prioridade || false,
        paciente_id,
        procedimento_id
      }
    });
    res.status(201).json(novoAtendimento);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar atendimento.' });
  }
});

app.put('/atendimentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { medico_id, status } = req.body;
    const atendimentoAtualizado = await prisma.atendimento.update({
      where: { id: parseInt(id) },
      data: { medico_id, status }
    });
    res.json(atendimentoAtualizado);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar atendimento.' });
  }
});

// --- USUÁRIOS ---
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;
    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha, cargo }
    });
    res.status(201).json(novoUsuario);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
});

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor voando na porta http://localhost:${PORTA}`);
});