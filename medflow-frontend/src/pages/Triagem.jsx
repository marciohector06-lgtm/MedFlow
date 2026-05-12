import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Triagem() {
  const [pacientes, setPacientes] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [vetais, setVetais] = useState({
    pressao: '',
    temperatura: '',
    peso: '',
    frequenciaCardiaca: '',
    saturacao: '',
    prioridade: 'VERDE',
    queixaPrincipal: ''
  });

  const carregarFila = async () => {
    try {
      const res = await api.get('/atendimentos');
      const fila = (res.data.dados || res.data || []).filter(a => 
        a.status === 'AGUARDANDO_TRIAGEM' && a.servico?.categoria !== 'ODONTOLOGIA'
      );
      setPacientes(fila);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarFila();
    const interval = setInterval(carregarFila, 20000);
    return () => clearInterval(interval);
  }, []);

  const finalizarTriagem = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/atendimentos/${selecionado.id}/status`, {
        status: 'AGUARDANDO_ATENDIMENTO',
        ...vetais
      });
      setSelecionado(null);
      setVetais({
        pressao: '',
        temperatura: '',
        peso: '',
        frequenciaCardiaca: '',
        saturacao: '',
        prioridade: 'VERDE',
        queixaPrincipal: ''
      });
      carregarFila();
      alert("Triagem concluída. Paciente encaminhado para o médico.");
    } catch (e) {
      alert("Erro ao processar triagem.");
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1>CENTRAL DE TRIAGEM - MEDFLOW</h1>
      </header>

      <main style={mainStyle}>
        <section style={panelWhite}>
          <h3>Fila de Espera</h3>
          <div style={filaContainer}>
            {pacientes.length === 0 ? (
              <div style={emptyStateSmall}>Fila vazia</div>
            ) : (
              pacientes.map(p => (
                <div key={p.id} style={cardFila}>
                  <div>
                    <strong>{p.paciente?.nome}</strong>
                    <br />
                    <small>{p.servico?.nome} - {new Date(p.createdAt).toLocaleTimeString()}</small>
                  </div>
                  <button onClick={() => setSelecionado(p)} style={btnSmall}>Iniciar</button>
                </div>
              ))
            )}
          </div>
        </section>

        <section style={panelWhite}>
          {selecionado ? (
            <>
              <h3>Avaliação: {selecionado.paciente?.nome}</h3>
              <form onSubmit={finalizarTriagem} style={formStyle}>
                <div style={inputGrid}>
                  <div style={inputGroup}>
                    <label>Pressão Arterial</label>
                    <input type="text" placeholder="120/80" value={vetais.pressao} onChange={e => setVetais({...vetais, pressao: e.target.value})} required style={inputStyle} />
                  </div>
                  <div style={inputGroup}>
                    <label>Temperatura (°C)</label>
                    <input type="text" placeholder="36.5" value={vetais.temperatura} onChange={e => setVetais({...vetais, temperatura: e.target.value})} required style={inputStyle} />
                  </div>
                  <div style={inputGroup}>
                    <label>Freq. Cardíaca (bpm)</label>
                    <input type="text" placeholder="80" value={vetais.frequenciaCardiaca} onChange={e => setVetais({...vetais, frequenciaCardiaca: e.target.value})} required style={inputStyle} />
                  </div>
                  <div style={inputGroup}>
                    <label>Saturação O2 (%)</label>
                    <input type="text" placeholder="98" value={vetais.saturacao} onChange={e => setVetais({...vetais, saturacao: e.target.value})} required style={inputStyle} />
                  </div>
                  <div style={inputGroup}>
                    <label>Peso (kg)</label>
                    <input type="text" placeholder="70" value={vetais.peso} onChange={e => setVetais({...vetais, peso: e.target.value})} required style={inputStyle} />
                  </div>
                  <div style={inputGroup}>
                    <label>Classificação de Risco</label>
                    <select 
                      value={vetais.prioridade} 
                      onChange={e => setVetais({...vetais, prioridade: e.target.value})} 
                      style={{...inputStyle, borderLeft: `12px solid ${prioridadeCores[vetais.prioridade]}`}}
                    >
                      <option value="AZUL">AZUL (Não Urgente)</option>
                      <option value="VERDE">VERDE (Pouco Urgente)</option>
                      <option value="AMARELO">AMARELO (Urgente)</option>
                      <option value="LARANJA">LARANJA (Muito Urgente)</option>
                      <option value="VERMELHO">VERMELHO (Emergência)</option>
                    </select>
                  </div>
                </div>
                
                <div style={inputGroup}>
                  <label>Queixa Principal / Observações</label>
                  <textarea value={vetais.queixaPrincipal} onChange={e => setVetais({...vetais, queixaPrincipal: e.target.value})} required style={{...inputStyle, height: '100px'}} />
                </div>

                <button type="submit" style={btnAction}>ENVIAR PARA CONSULTA MÉDICA</button>
              </form>
            </>
          ) : (
            <div style={emptyState}>
              <p>Aguardando seleção de paciente para início dos sinais vitais.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const prioridadeCores = {
  AZUL: '#3498db',
  VERDE: '#2ecc71',
  AMARELO: '#f1c40f',
  LARANJA: '#e67e22',
  VERMELHO: '#e74c3c'
};

const containerStyle = { minHeight: '100vh', backgroundColor: '#f4f7f6' };
const headerStyle = { backgroundColor: '#2c3e50', color: '#fff', padding: '20px', textAlign: 'center' };
const mainStyle = { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', padding: '30px', maxWidth: '1400px', margin: '0 auto' };
const panelWhite = { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: 'fit-content' };
const filaContainer = { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' };
const cardFila = { padding: '15px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdfdfd' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' };
const inputGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '15px' };
const btnAction = { padding: '15px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const btnSmall = { padding: '8px 15px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const emptyState = { height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6', border: '2px dashed #eee', borderRadius: '12px' };
const emptyStateSmall = { textAlign: 'center', padding: '20px', color: '#bdc3c7' };