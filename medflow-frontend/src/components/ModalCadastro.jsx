import { useState } from 'react';
import { api, viaCep } from '../services/api';
import { calcularRegrasIdade } from '../utils/regrasIdade';

export default function ModalCadastro({ fecharModal, atualizarFila }) {
  const [novoAtendimento, setNovoAtendimento] = useState({
    nome: '', cpf: '', telefone: '', nascimento: '',
    convenio: 'PARTICULAR', carteirinha: '', sexo: '', 
    nome_mae: '', email: '', cep: '', endereco: '', responsavel: '' 
  });

  const { precisaResponsavel, ehMenor } = calcularRegrasIdade(novoAtendimento.nascimento);

  const buscarCEP = async (valor) => {
    setNovoAtendimento({ ...novoAtendimento, cep: valor });
    if (valor.length === 8) {
      try {
        const resposta = await viaCep.get(`${valor}/json/`);
        if (!resposta.data.erro) {
          setNovoAtendimento(prev => ({
            ...prev,
            endereco: `${resposta.data.logradouro}, ${resposta.data.bairro} - ${resposta.data.localidade}`
          }));
        }
      } catch (err) {
        console.log("CEP não encontrado");
      }
    }
  };

  const finalizarCadastro = async (e) => {
    e.preventDefault();

    if (ehMenor && !novoAtendimento.nome_mae) {
      alert("Atenção: Nome da mãe é obrigatório para menores!");
      return;
    }

    try {
      // Usando a API que configuramos no Service
      const pac = await api.post('/pacientes', {
        ...novoAtendimento,
        data_nascimento: novoAtendimento.nascimento
      });

      await api.post('/atendimentos', {
        paciente_id: pac.data.id,
        tipo: 'Consulta',
        procedimento_id: 1, 
        convenio: novoAtendimento.convenio || "PARTICULAR",
        numero_guia: novoAtendimento.carteirinha,
        status: 'AGUARDANDO'
      });

      alert("Sucesso! Paciente está na fila.");
      fecharModal(); // Fecha a janela usando a função que veio do App.jsx
      atualizarFila(); // Atualiza a tabela do App.jsx
    } catch (err) {
      alert("Erro ao salvar. Verifique se o CPF está correto.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📄 Cadastro do Paciente</h3>
        <form onSubmit={finalizarCadastro} className="form-grid">
          <input type="text" placeholder="Nome" required onChange={e => setNovoAtendimento({...novoAtendimento, nome: e.target.value})} />
          <input type="text" placeholder="CPF" required maxLength="11" onChange={e => setNovoAtendimento({...novoAtendimento, cpf: e.target.value})} />
          <input type="date" required onChange={e => setNovoAtendimento({...novoAtendimento, nascimento: e.target.value})} />
          
          <select required onChange={e => setNovoAtendimento({...novoAtendimento, sexo: e.target.value})}>
            <option value="">Sexo...</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>

          <input type="email" placeholder="E-mail" onChange={e => setNovoAtendimento({...novoAtendimento, email: e.target.value})} />
          <input type="text" placeholder="WhatsApp" onChange={e => setNovoAtendimento({...novoAtendimento, telefone: e.target.value})} />
          
          <input type="text" placeholder="CEP" maxLength="8" onChange={e => buscarCEP(e.target.value)} />
          <input type="text" placeholder="Endereço" value={novoAtendimento.endereco} onChange={e => setNovoAtendimento({...novoAtendimento, endereco: e.target.value})} />

          <input 
            type="text" 
            placeholder={ehMenor ? "Nome da Mãe (Obrigatório)" : "Nome da Mãe"} 
            required={ehMenor}
            onChange={e => setNovoAtendimento({...novoAtendimento, nome_mae: e.target.value})} 
          />

          <input 
            type="text" 
            placeholder={precisaResponsavel ? "Responsável (Obrigatório)" : "Responsável (Opcional)"} 
            required={precisaResponsavel}
            onChange={e => setNovoAtendimento({...novoAtendimento, responsavel: e.target.value})} 
          />

          <select onChange={e => setNovoAtendimento({...novoAtendimento, convenio: e.target.value})}>
            <option value="PARTICULAR">PARTICULAR</option>
            <option value="UNIMED">UNIMED</option>
          </select>
          <input type="text" placeholder="Nº Carteirinha" onChange={e => setNovoAtendimento({...novoAtendimento, carteirinha: e.target.value})} />

          <div className="modal-actions">
            <button type="button" onClick={fecharModal}>Sair</button>
            <button type="submit" className="btn-save">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}