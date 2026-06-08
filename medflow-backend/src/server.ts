import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { router } from './routes';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

app.use(router);

io.on('connection', (_socket) => {});

server.listen(3333, () => {
  console.log('Servidor MedFlow rodando na porta 3333');
});