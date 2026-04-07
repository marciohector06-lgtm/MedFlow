const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');

router.get('/', atendimentoController.listar);
router.post('/', atendimentoController.criar);
router.patch('/:id/ausente', atendimentoController.reportarAusencia); // Rota nova pra funcionalidade!

module.exports = router;