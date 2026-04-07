class WhatsappService {
  async enviarNotificacaoFila(telefone, nomePaciente, posicao) {
    // No futuro, aqui entra a API oficial do WhatsApp
    console.log(`[WHATSAPP MOCK] 📱 Mensagem enviada para ${telefone}:`);
    console.log(`"Olá ${nomePaciente}, você é o número ${posicao} na fila. Fique atento!"`);
    return true;
  }
}
module.exports = new WhatsappService();