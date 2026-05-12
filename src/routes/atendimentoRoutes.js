const express = require('express');
const router = express.Router();
const { verificarToken, verificarRole } = require('../middlewares/auth');
const atendimentoController = require('../controllers/atendimentoController');

router.get('/', atendimentoController.listar);
router.post('/', atendimentoController.criar);
router.patch('/:id/ausente', atendimentoController.reportarAusencia); // Rota nova pra funcionalidade!
router.patch('/:id/status', 
    verificarToken, 
    verificarRole(['TRIAGEM', 'MEDICO', 'SUPERADMIN']), 
    atendimentoController.mudarStatus
);

module.exports = router;