const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/', pacienteController.listar);
router.post('/', pacienteController.criar);

module.exports = router;