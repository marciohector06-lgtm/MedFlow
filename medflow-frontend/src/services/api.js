import axios from 'axios';

// Conexão com o seu Backend Node.js
export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// Conexão com a API do Correios
export const viaCep = axios.create({
  baseURL: 'https://viacep.com.br/ws/',
});