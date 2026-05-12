import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Exames() {
  const [filaExames, setFilaExames] = useState([]);
  const [exameAtual, setExameAtual] = useState(null);
  const [resultado, setResultado] = useState('');

  const carregarFila = async () => {
    try {
      const res = await api.get('/atendimentos');
      const aguardando = (res.data.dados || res.data || []).filter(a => a.status === 'AGUARDANDO_EXAME');
      setFilaExames(aguardando);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarFila();
  }, []);

  const finalizarExame = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/atendimentos/${exameAtual.id}/status`, {
        status: 'AGUARDANDO',
        observacoes: resultado
      });
      setExameAtual(null);
      setResultado('');
      carregarFila();
      alert('Exame finalizado e enviado ao médico!');
    } catch (e) {
      alert('Erro ao salvar o exame');
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1>SALA DE EXAMES E COLETA</h1>
      </header>

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {!exameAtual ? (
          <section style={panelWhite}>
            <h3 style={{ marginBottom: '20px' }}>Fila de Pacientes</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px' }}>Paciente</th>
                  <th style={{ padding: '10px' }}>Solicitação</th>
                  <th style={{ padding: '10px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filaExames.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 10px' }}>{p.paciente?.nome}</td>
                    <td style={{ padding: '15px 10px' }}>{p.observacoes || 'Exame de Rotina'}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <button onClick={() => setExameAtual(p)} style={btnAction}>
                        Iniciar Exame
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <section style={panelWhite}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>Paciente: {exameAtual.paciente?.nome}</h2>
              <button onClick={() => setExameAtual(null)} style={btnCancel}>Cancelar</button>
            </div>
            <form onSubmit={finalizarExame} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <textarea
                placeholder="Laudo técnico, parâmetros ou resultado da coleta..."
                value={resultado}
                onChange={e => setResultado(e.target.value)}
                required
                style={{ ...inputStyle, height: '150px', resize: 'vertical' }}
              />
              <button type="submit" style={btnSuccess}>
                Gravar Resultado e Devolver ao Médico
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

const containerStyle = { minHeight: '100vh', backgroundColor: '#f0f2f5' };
const headerStyle = { backgroundColor: '#34495e', color: '#fff', padding: '20px', textAlign: 'center' };
const panelWhite = { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const inputStyle = { padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' };
const btnAction = { padding: '8px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnSuccess = { padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const btnCancel = { padding: '8px 15px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '4px', cursor: 'pointer' };