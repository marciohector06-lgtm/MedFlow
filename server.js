const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Rota 1: Teste de vida
app.get('/', (req, res) => {
  res.json({ mensagem: 'API do MedFlow rodando 100%!' });
});

// Rota 2: Buscar todos os pacientes (GET)
app.get('/pacientes', async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany();
    res.json(pacientes);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar pacientes' });
  }
});

// Rota 3: CADASTRAR novo paciente (POST) - ESSA AQUI QUE TAVA FALTANDO!
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

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor voando na porta http://localhost:${PORTA}`);
});