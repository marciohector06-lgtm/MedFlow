require('dotenv').config(); //faz requerimento do dotenv e detectar as variáveis de ambiente  
const express = require('express'); //declara o express e faz sua requisição
const cors = require('cors'); //requere a estrutura cors para todos os roles
const morgan = require('morgan'); //firulagem pra deixar o terminal mais colorido

const atendimentoRoutes = require('./routes/atendimentoRoutes'); //Importa as rotas de atendimento
const pacienteRoutes = require('./routes/pacienteRoutes'); //Importa as rotas de paciente

const app = express(); //declara app variável universal para usar o express e puxar suas funcionalidades
app.use(cors());
app.use(express.json()); // usa funcionalidade do express para poder responder com .json
app.use(morgan('dev'));

// Rota inicial
app.get('/', (req, res) => {
  res.json({ mensagem: '🚀 API do MedFlow estruturada e rodando 100%!' }); //ao entrar na rota inicial faz se uma requisição get e o servidor devolve essa mensagem
});

// Usando as rotas
app.use('/atendimentos', atendimentoRoutes); //ativa a rota de atendimentos
app.use('/pacientes', pacienteRoutes); //ativa a rota de pacientes

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 API MedFlow estruturada e voando na porta ${PORTA}`);
});