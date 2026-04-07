const pacienteService = require('../services/pacienteService');

class PacienteController {
  async listar(req, res) {
    try {
      const { cpf, pagina, limite } = req.query;
      const resultado = await pacienteService.listar(cpf, pagina, limite);
      res.json(resultado);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
    }
  }

  async criar(req, res) {
    try {
      const novoPaciente = await pacienteService.criar(req.body);
      res.status(201).json(novoPaciente);
    } catch (erro) {
      // Se o erro for a nossa validação do Service, mandamos status 400 (Bad Request)
      if (erro.message.includes('obrigatórios') || erro.message.includes('inválido')) {
        return res.status(400).json({ erro: erro.message });
      }
      
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao cadastrar. O CPF já existe no banco?' });
    }
  }
}

module.exports = new PacienteController();