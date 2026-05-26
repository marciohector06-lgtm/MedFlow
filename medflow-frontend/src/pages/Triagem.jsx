import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { io } from 'socket.io-client';

export default function Triagem() {
  const [fila, setFila] = useState([]);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [formTriagem, setFormTriagem] = useState({
    pressao: '',
    temperatura: '',
    saturacao: '',
    peso: '',
    queixa: ''
  });

  const carregarFila = async () => {
    try {
      const res = await api.get('/atendimentos');
      const dados = res.data.dados || res.data || [];
      setFila(dados.filter(a => a.status === 'ABERTO' || a.status === 'AGUARDANDO_TRIAGEM'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarFila();

    const socket = io(api.defaults.baseURL || 'http://localhost:3333');

    socket.on('novo_atendimento', carregarFila);
    socket.on('atualizar_fila', carregarFila);
    socket.on('status_atualizado', carregarFila);

    return () => {
      socket.disconnect();
    };
  }, []);

  const selecionarPaciente = (paciente) => {
    setPacienteAtual(paciente);
    setFormTriagem({ pressao: '', temperatura: '', saturacao: '', peso: '', queixa: '' });
  };

  const salvarTriagem = async (e) => {
    e.preventDefault();
    try {
      const resumoSintomas = `[TRIAGEM]\nPA: ${formTriagem.pressao} | Temp: ${formTriagem.temperatura}ºC | O2: ${formTriagem.saturacao}% | Peso: ${formTriagem.peso}kg\nQueixa: ${formTriagem.queixa}`;

      await api.put(`/atendimentos/${pacienteAtual.id}/status`, {
        status: 'AGUARDANDO_ATENDIMENTO',
        sintomas: resumoSintomas
      });

      setPacienteAtual(null);
      carregarFila();
    } catch (error) {
      alert('Erro ao salvar triagem');
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Triagem / Enfermagem</h2>
      </header>

      <main style={mainContentStyle}>
        {!pacienteAtual ? (
          <section style={panelWhite}>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Pacientes Aguardando Triagem</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRow}>
                  <th style={thStyle}>Ficha</th>
                  <th style={thStyle}>Paciente</th>
                  <th style={thStyle}>Acao</th>
                </tr>
              </thead>
              <tbody>
                {fila.length === 0 ? (
                  <tr><td colSpan="3" style={emptyStateStyle}>Nenhum paciente aguardando triagem.</td></tr>
                ) : (
                  fila.map(p => (
                    <tr key={p.id} style={tableRow}>
                      <td style={tdStyle}>#{p.id.substring(0,5).toUpperCase()}</td>
                      <td style={tdStyle}><strong>{p.paciente?.nome}</strong></td>
                      <td style={tdStyle}>
                        <button onClick={() => selecionarPaciente(p)} style={btnAction}>Avaliar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        ) : (
          <section style={panelWhite}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f0f2f5', paddingBottom: '20px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>Triagem: {pacienteAtual.paciente?.nome}</h2>
              <button onClick={() => setPacienteAtual(null)} style={btnCancel}>Cancelar</button>
            </div>

            <form onSubmit={salvarTriagem} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Pressao Arterial</label>
                  <input type="text" placeholder="Ex: 12x8" value={formTriagem.pressao} onChange={e => setFormTriagem({...formTriagem, pressao: e.target.value})} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Temperatura (ºC)</label>
                  <input type="text" placeholder="Ex: 36.5" value={formTriagem.temperatura} onChange={e => setFormTriagem({...formTriagem, temperatura: e.target.value})} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Saturacao O2 (%)</label>
                  <input type="text" placeholder="Ex: 98" value={formTriagem.saturacao} onChange={e => setFormTriagem({...formTriagem, saturacao: e.target.value})} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Peso (kg)</label>
                  <input type="text" placeholder="Ex: 75" value={formTriagem.peso} onChange={e => setFormTriagem({...formTriagem, peso: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Queixa Principal / Observacoes</label>
                <textarea 
                  placeholder="Relato do paciente na triagem..." 
                  value={formTriagem.queixa} 
                  onChange={e => setFormTriagem({...formTriagem, queixa: e.target.value})} 
                  required 
                  style={{ ...inputStyle, height: '100px', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" style={btnSuccess}>Salvar Triagem e Enviar ao Medico</button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

const containerStyle = { minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { marginBottom: '20px', backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const mainContentStyle = { maxWidth: '1200px', margin: '0 auto' };
const panelWhite = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const tableHeaderRow = { backgroundColor: '#f8f9fa', borderBottom: '2px solid #dfe6e9' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '13px', color: '#7f8c8d', textTransform: 'uppercase' };
const tableRow = { borderBottom: '1px solid #f0f2f5' };
const tdStyle = { padding: '16px 15px', verticalAlign: 'middle' };
const emptyStateStyle = { padding: '40px', textAlign: 'center', color: '#95a5a6' };
const labelStyle = { display: 'block', fontSize: '13px', color: '#34495e', marginBottom: '8px', fontWeight: '600' };
const inputStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid #dfe6e9', fontSize: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fbfcfc' };
const btnAction = { padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnSuccess = { padding: '15px 30px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancel = { padding: '10px 20px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };