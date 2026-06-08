import axios from 'axios';

class WhatsAppQueue {
  private queue: Array<{ telefone: string; templateName: string; parametros: string[] }> = [];
  private isProcessing = false;

  adicionar(telefone: string, templateName: string, parametros: string[] = []) {
    const telefoneFormatado = telefone.replace(/\D/g, '');
    this.queue.push({ telefone: `55${telefoneFormatado}`, templateName, parametros });
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
    const { telefone, templateName, parametros } = this.queue.shift()!;

    try {
      await axios.post(
        `https://graph.facebook.com/v20.0/${process.env.WA_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: telefone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'pt_BR' },
            components: parametros.length > 0
              ? [{ type: 'body', parameters: parametros.map(p => ({ type: 'text', text: p })) }]
              : []
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WA_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      console.error('WhatsApp API error:', error?.response?.data || error.message);
    }

    setTimeout(() => this.processar(), 1000);
  }
}

export const whatsappQueue = new WhatsAppQueue();
