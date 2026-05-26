import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

api.interceptors.request.use(async config => {
  const token = localStorage.getItem('@MedFlow:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export const viaCep = axios.create({
  baseURL: 'https://viacep.com.br/ws/',
});