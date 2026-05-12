const sadtService = require('../services/sadtService');

class SadtController {
  async criarSolicitacao(req, res) {
    try {
      const novoExame = await sadtService.solicitarExame(req.body);
      res.status(201).json(novoExame);
    } catch (erro) {
      if (erro.message.includes('obrigatórios')) {
        return res.status(400).json({ erro: erro.message });
      }
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao solicitar exame no SADT.' });
    }
  }

  async listarPorAtendimento(req, res) {
    try {
      const { atendimentoId } = req.params;
      const exames = await sadtService.listarExamesPorAtendimento(atendimentoId);
      res.json(exames);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao buscar exames deste atendimento.' });
    }
  }

  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const atualizado = await sadtService.atualizarStatusExame(id, status);
      res.json(atualizado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

module.exports = new SadtController();