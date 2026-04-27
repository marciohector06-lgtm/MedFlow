import { useState } from 'react';
import { api } from '../services/api';

export default function ModalCadastro({ fecharModal, atualizarFila }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [convenio, setConvenio] = useState('PARTICULAR');
  const [numCarteirinha, setNumCarteirinha] = useState('');

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atendimentos', {
        nome,
        cpf,
        data_nascimento: dataNascimento ? new Date(dataNascimento).toISOString() : new Date('1990-01-01T00:00:00Z').toISOString(),
        sexo: sexo || 'M',
        whatsapp: whatsapp || '00000000000',
        cep: cep || '00000-000',
        endereco: endereco || 'Endereço não informado',
        convenio
      });
      atualizarFila();
      fecharModal();
    } catch (error) {
      alert('Erro ao salvar o paciente. Verifique se o CPF já existe.');
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          📄 Cadastro do Paciente
        </h2>
        
        <form onSubmit={handleSalvar}>
          <div style={gridStyle}>
            <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} required style={inputStyle} />
            
            <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required style={inputStyle} />
            <select value={sexo} onChange={e => setSexo(e.target.value)} required style={inputStyle}>
              <option value="">Sexo...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
            
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required style={inputStyle} />
            
            <input type="text" placeholder="CEP" value={cep} onChange={e => setCep(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} required style={inputStyle} />
            
            <input type="text" placeholder="Nome da Mãe" value={nomeMae} onChange={e => setNomeMae(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Responsável (Opcional)" value={responsavel} onChange={e => setResponsavel(e.target.value)} style={inputStyle} />
            
            <select value={convenio} onChange={e => setConvenio(e.target.value)} style={inputStyle}>
              <option value="PARTICULAR">PARTICULAR</option>
              <option value="UNIMED">UNIMED</option>
              <option value="BRADESCO">BRADESCO SAÚDE</option>
            </select>
            <input type="text" placeholder="Nº Carteirinha" value={numCarteirinha} onChange={e => setNumCarteirinha(e.target.value)} style={inputStyle} />
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
const modalStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '700px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const btnSairStyle = { padding: '10px 20px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' };
const btnSalvarStyle = { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '4px', backgroundColor: '#3498db', color: 'white', fontWeight: 'bold' };