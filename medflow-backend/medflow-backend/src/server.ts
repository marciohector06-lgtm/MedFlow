import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { router } from './routes';

const app = express();

// 1. Criando o servidor HTTP junto com o Express (exigência do WebSocket)
const server = http.createServer(app);

// 2. Ligando o Socket.io e liberando a porta pro Frontend conectar
const io = new Server(server, {
  cors: {
    origin: '*', // Libera para o nosso React conectar sem dar erro de CORS
  }
});

app.use(cors());
app.use(express.json());

// 3. O TRUQUE DE MESTRE: Salva o 'io' dentro do app pra gente conseguir acionar ele lá nas rotas!
app.set('io', io);

// Toda vez que alguém abrir a tela, ele avisa aqui!
io.on('connection', (socket) => {
  console.log(`🔌 Novo radar conectado! ID: ${socket.id}`);
});

app.use(router);

// 4. Atenção aqui: agora quem liga é o 'server' e não mais o 'app'
server.listen(3333, () => {
  console.log('🚀 Servidor com WebSockets TÁ ON na porta 3333!');
});