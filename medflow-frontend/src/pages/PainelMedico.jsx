import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function PainelMedico() {
  const [fila, setFila] = useState([]);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [prescricao, setPrescricao] = useState('');

  const carregarFila = async () => {
    try {
      const res = await api.get('/atendimentos');
      const listaTotal = res.data.dados || res.data || [];
      setFila(listaTotal);
    } catch (e) {
      console.log("Erro ao carregar a fila do médico");
    }
  };

  useEffect(() => {
    carregarFila();
  }, []);

  const chamarPaciente = (paciente) => {
    setPacienteAtual(paciente);
    setSintomas('');
    setDiagnostico('');
    setPrescricao('');
  };

  const finalizarAtendimento = () => {
    alert("✅ Consulta finalizada com sucesso!");
    setPacienteAtual(null);
    carregarFila();
  };

  const solicitarExame = () => {
    alert("🧪 Pedido de Exame (SADT) gerado! Paciente encaminhado para coleta interna.");
    setPacienteAtual(null);
    carregarFila();
  };

  const marcarRetorno = () => {
    alert("📅 Retorno de 15 dias sem custo liberado para agendamento na recepção.");
    setPacienteAtual(null);
    carregarFila();
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="logo-section"><h2>MedFlow</h2></div>
        <nav className="menu-nav">
          <button className="active">🩺 Consultório</button>
          <button>📖 Histórico</button>
        </nav>
      </aside>

      <main className="content">
        <header className="content-header">
          <h1>PAINEL MÉDICO</h1>
          <div className="user-info">Médico: <strong>Dr. Márcio Henrique</strong></div>
        </header>

        {!pacienteAtual && (
          <section className="panel">
            <h3>Pacientes Aguardando Atendimento</h3>
            <table className="medflow-table">
              <thead>
                <tr>
                  <th>Ficha</th>
                  <th>Paciente</th>
                  <th>Convênio</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {fila.length === 0 ? (
                  <tr><td colSpan="4" style={{textAlign: 'center'}}>Consultório vazio. Nenhum paciente na fila.</td></tr>
                ) : (
                  fila.map(item => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.paciente?.nome || item.nome || 'Paciente Externo'}</td>
                      <td>{item.convenio}</td>
                      <td>
                        <button className="btn-save" onClick={() => chamarPaciente(item)}>
                          Chamar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {pacienteAtual && (
          <section className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Atendendo: {pacienteAtual.paciente?.nome || pacienteAtual.nome || 'Paciente Externo'}</h2>
              <span className="status-tag" style={{ background: '#ffc107', color: '#000' }}>EM ATENDIMENTO</span>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              
              <div className="input-group">
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Sintomas (Anamnese)</label>
                <textarea 
                  rows="3" 
                  placeholder="Descreva os Sintomas e queixas do paciente..."
                  value={sintomas}
                  onChange={(e) => setSintomas(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
                />
              </div>

              <div className="input-group" style={{ marginTop: '15px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Diagnóstico</label>
                <textarea 
                  rows="3" 
                  placeholder="Qual o Diagnóstico médico..."
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
                />
              </div>

              <div className="input-group" style={{ marginTop: '15px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Prescrição Médica</label>
                <textarea 
                  rows="3" 
                  placeholder="Prescrição de medicamentos e recomendações..."
                  value={prescricao}
                  onChange={(e) => setPrescricao(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
              <button 
                onClick={solicitarExame} 
                style={{ background: '#ff9800', color: '#fff', padding: '12px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                🧪 Solicitar Exame (SADT)
              </button>

              <button 
                onClick={marcarRetorno} 
                style={{ background: '#17a2b8', color: '#fff', padding: '12px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                📅 Indicar Retorno
              </button>

              <button 
                onClick={finalizarAtendimento} 
                style={{ background: '#28a745', color: '#fff', padding: '12px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>
                ✅ Salvar e Finalizar Consulta
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}