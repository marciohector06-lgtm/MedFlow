import { useState } from 'react';
import { api } from '../services/api';
import axios from 'axios';

export default function ModalCadastro({ fecharModal, atualizarFila }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [cpfResponsavel, setCpfResponsavel] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [convenio, setConvenio] = useState('PARTICULAR');
  const [numCarteirinha, setNumCarteirinha] = useState('');

  const aplicarMascaraCpf = (valor) => {
    let v = valor.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  };

  const aplicarMascaraWhatsApp = (valor) => {
    let v = valor.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    return v;
  };

  const handleCep = async (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    setCep(v.replace(/^(\d{5})(\d)/, '$1-$2'));

    if (v.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${v}/json/`);
        if (!response.data.erro) {
          setEndereco(response.data.logradouro);
          setBairro(response.data.bairro);
          setCidade(response.data.localidade);
          setUf(response.data.uf);
        }
      } catch (error) {
        console.error(error);
        alert('Erro ao buscar CEP na base dos Correios.');
      }
    }
  };

  const calcularIdade = (data) => {
    const hoje = new Date();
    const nasc = new Date(data);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();

    if (!dataNascimento) {
      return alert('A data de nascimento é obrigatória.');
    }

    const idade = calcularIdade(dataNascimento);

    if (idade < 18 && (!nomeMae.trim() || !responsavel.trim())) {
      return alert('Para pacientes menores de 18 anos, os campos Nome da Mãe e Responsável são obrigatórios.');
    }

    if (idade >= 60 && !responsavel.trim()) {
      return alert('Para pacientes com 60 anos ou mais, o campo Responsável/Acompanhante é obrigatório.');
    }

    try {
      await api.post('/atendimentos', {
        nome,
        cpf: cpf.replace(/\D/g, ''),
        data_nascimento: new Date(dataNascimento).toISOString(),
        sexo,
        whatsapp: whatsapp.replace(/\D/g, ''),
        cep: cep.replace(/\D/g, ''),
        endereco,
        numero,
        bairro,
        cidade,
        uf,
        nome_mae: nomeMae,
        nome_responsavel: responsavel,
        cpf_responsavel: cpfResponsavel.replace(/\D/g, ''),
        parentesco,
        convenio,
        numero_guia: numCarteirinha,
        status: 'AGUARDANDO_TRIAGEM',
        categoria: 'GERAL',
        paciente: { nome: nome }
      });
      atualizarFila();
      fecharModal();
    } catch (error) {
      console.error(error);
      const mensagemErro = error.response?.data?.error || 'Verifique o terminal do backend para mais detalhes.';
      alert(`Falha ao salvar o paciente: ${mensagemErro}`);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
           Cadastro do Paciente
        </h2>
        
        <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={gridStyle}>
            <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} required maxLength="100" style={inputStyle} />
            <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(aplicarMascaraCpf(e.target.value))} required style={inputStyle} />
            
            <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required style={inputStyle} />
            <select value={sexo} onChange={e => setSexo(e.target.value)} required style={inputStyle}>
              <option value="">Sexo...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
            
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} maxLength="100" style={inputStyle} />
            <input type="text" placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(aplicarMascaraWhatsApp(e.target.value))} required style={inputStyle} />
            
            <input type="text" placeholder="CEP" value={cep} onChange={handleCep} required style={inputStyle} />
            <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} required maxLength="150" style={inputStyle} />
            <input type="text" placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} required maxLength="20" style={inputStyle} />
            <input type="text" placeholder="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} required maxLength="100" style={inputStyle} />
            <input type="text" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} required maxLength="100" style={inputStyle} />
            <input type="text" placeholder="UF" value={uf} onChange={e => setUf(e.target.value)} required maxLength="2" style={inputStyle} />
            
            <input type="text" placeholder="Nome da Mãe" value={nomeMae} onChange={e => setNomeMae(e.target.value)} maxLength="100" style={inputStyle} />
            <input type="text" placeholder="Responsável/Acompanhante" value={responsavel} onChange={e => setResponsavel(e.target.value)} maxLength="100" style={inputStyle} />
            <input type="text" placeholder="CPF do Responsável" value={cpfResponsavel} onChange={e => setCpfResponsavel(aplicarMascaraCpf(e.target.value))} style={inputStyle} />
            <input type="text" placeholder="Parentesco" value={parentesco} onChange={e => setParentesco(e.target.value)} maxLength="50" style={inputStyle} />
            
            <select value={convenio} onChange={e => setConvenio(e.target.value)} style={inputStyle}>
              <option value="PARTICULAR">PARTICULAR</option>
              <option value="UNIMED">UNIMED</option>
              <option value="BRADESCO">BRADESCO SAÚDE</option>
            </select>
            <input type="text" placeholder="Nº Carteirinha (Convênio)" value={numCarteirinha} onChange={e => setNumCarteirinha(e.target.value)} maxLength="30" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={fecharModal} style={btnSairStyle}>Sair</button>
            <button type="submit" style={btnSalvarStyle}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const btnSairStyle = { padding: '10px 20px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' };
const btnSalvarStyle = { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '4px', backgroundColor: '#3498db', color: 'white', fontWeight: 'bold' };