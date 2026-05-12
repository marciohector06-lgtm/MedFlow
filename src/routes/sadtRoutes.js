const express = require('express');
const router = express.Router();
const { verificarToken, verificarRole } = require('../middlewares/auth');
const sadtController = require('../controllers/sadtController');

// Rota para o médico solicitar um novo exame (US-04)
router.post('/', 
    verificarToken, 
    verificarRole(['MEDICO', 'SUPERADMIN']), 
    sadtController.criarSolicitacao
);

// Rota para ver todos os exames de uma ficha de atendimento específica
router.get('/atendimento/:atendimentoId', 
    verificarToken, 
    sadtController.listarPorAtendimento
);

// Rota para o laboratório/SADT atualizar o status do exame (ex: de SOLICITADO para CONCLUIDO)
router.patch('/:id/status', 
    verificarToken, 
    verificarRole(['SADT', 'MEDICO', 'SUPERADMIN']), 
    sadtController.atualizarStatus
);

module.exports = router;