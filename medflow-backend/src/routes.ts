import { Router } from 'express';
import { AtendimentoController } from './controllers/atendimentoController';
import { UsuarioController } from './controllers/usuarioController';
import { ServicoController } from './controllers/servicoController';
import { ProdutoController } from './controllers/produtoController';
import { CampanhaController } from './controllers/campanhaController';

const router = Router();

const atendimentoController = new AtendimentoController();
const usuarioController = new UsuarioController();
const servicoController = new ServicoController();
const produtoController = new ProdutoController();
const campanhaController = new CampanhaController();

router.get('/atendimentos', atendimentoController.listar);
router.post('/atendimentos', atendimentoController.criar);
router.put('/atendimentos/:id/status', atendimentoController.atualizarStatus);

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