import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { AtendimentoController } from './controllers/atendimentoController';
import { UsuarioController } from './controllers/usuarioController';
import { ServicoController } from './controllers/servicoController';
import { ProdutoController } from './controllers/produtoController';
import { CampanhaController } from './controllers/campanhaController';
import { authMiddleware } from './middlewares/authMiddleware';

const router = Router();

const authController = new AuthController();
const atendimentoController = new AtendimentoController();
const usuarioController = new UsuarioController();
const servicoController = new ServicoController();
const produtoController = new ProdutoController();
const campanhaController = new CampanhaController();

router.post('/login', authController.login);

router.use(authMiddleware);

router.get('/atendimentos', atendimentoController.listar);
router.post('/atendimentos', atendimentoController.criar);
router.put('/atendimentos/:id/status', atendimentoController.atualizarStatus);
router.post('/atendimentos/:id/exames', atendimentoController.solicitarExame);
router.delete('/atendimentos/:id', atendimentoController.deletar);
router.get('/pacientes/:cpf', atendimentoController.buscarCpf);

router.get('/usuarios', usuarioController.listar);
router.post('/usuarios', usuarioController.criar);
router.delete('/usuarios/:id', usuarioController.remover);

router.get('/servicos', servicoController.listar);
router.post('/servicos', servicoController.criar);

router.get('/produtos', produtoController.listar);
router.post('/produtos', produtoController.criar);
router.put('/produtos/:id/baixa', produtoController.baixaAutomatica);

router.get('/campanhas', campanhaController.listar);
router.post('/campanhas/disparar', campanhaController.disparar);

export { router };