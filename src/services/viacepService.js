// Você precisará instalar o axios: npm install axios
const axios = require('axios');

class ViaCepService {
  async buscarEndereco(cep) {
    try {
      // Limpa o CEP pra garantir que só tem números
      const cepLimpo = cep.replace(/\D/g, ''); 
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      return response.data;
    } catch (error) {
      throw new Error('Falha ao buscar CEP');
    }
  }
}
module.exports = new ViaCepService();