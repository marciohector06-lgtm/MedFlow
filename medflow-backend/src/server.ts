import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { router } from './routes';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', 
  }
});

app.use(cors());
app.use(express.json());

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Novo radar conectado! ID: ${socket.id}`);
});

app.use(router);

const PORT = process.env.PORT || 3333;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MedFlow online na porta ${PORT}`);
});