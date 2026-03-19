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


app.get('/pacientes', async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany();
    res.json(pacientes);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar pacientes' });
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
    res.status(500).json({ erro: 'Erro ao cadastrar. O CPF pode estar duplicado.' });
  }
});

// --- ROTAS DE PROCEDIMENTOS ---


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


// --- ROTAS DE ATENDIMENTOS ---


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
    res.status(500).json({ erro: 'Erro ao criar atendimento. Verifique se o paciente e procedimento existem.' });
  }
});


app.get('/atendimentos', async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
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

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor voando na porta http://localhost:${PORTA}`);
});