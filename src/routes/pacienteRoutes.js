const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

// Deixe apenas a barra inicial, pois o prefixo já foi dado no server.js
router.get('/', pacienteController.listar);
router.post('/', pacienteController.criar); 

module.exports = router;