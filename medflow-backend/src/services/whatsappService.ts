import axios from 'axios';

class WhatsAppQueue {
  private queue: Array<{ telefone: string; mensagem: string }> = [];
  private isProcessing = false;

  adicionar(telefone: string, mensagem: string) {
    const telefoneFormatado = telefone.replace(/\D/g, '');
    this.queue.push({ telefone: `55${telefoneFormatado}`, mensagem });
    
    if (!this.isProcessing) {
      this.processar();
    }
  }

  private async processar() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const { telefone, mensagem } = this.queue.shift()!;

    try {
      await axios.post(
        `https://graph.facebook.com/v25.0/${process.env.WA_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: telefone,
          type: 'text',
          text: { body: mensagem },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WA_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Erro na fila do WhatsApp:', error?.response?.data || error.message);
    }

    setTimeout(() => this.processar(), 1000);
  }
}

export const whatsappQueue = new WhatsAppQueue();