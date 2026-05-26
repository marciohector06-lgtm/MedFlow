import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { io } from 'socket.io-client';

export default function Exames() {
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [exameAtual, setExameAtual] = useState(null);
  const [resultado, setResultado] = useState('');
  const [laudoPdf, setLaudoPdf] = useState('');

  const carregarFilaSADT = async () => {
    try {
      const res = await api.get('/atendimentos');
      const atendimentosTotais = res.data.dados || res.data || [];
      
      let examesExtraidos = [];

      atendimentosTotais.forEach(atendimento => {
        if (atendimento.exames && atendimento.exames.length > 0) {
          atendimento.exames.forEach(exame => {
            if (exame.status === 'PENDENTE') {
              examesExtraidos.push({
                ...exame,
                paciente: atendimento.paciente,
                medicoSintomas: atendimento.sintomas
              });
            }
          });
        }
      });

      examesExtraidos.sort((a, b) => {
        if (a.prioridade === 'Vermelho') return -1;
        if (a.prioridade === 'Amarelo' && b.prioridade !== 'Vermelho') return -1;
        if (b.prioridade === 'Vermelho') return 1;
        if (b.prioridade === 'Amarelo' && a.prioridade !== 'Vermelho') return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      setPedidosPendentes(examesExtraidos);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarFilaSADT();

    const socket = io(api.defaults.baseURL || 'http://localhost:3333');

    socket.on('novo_exame_sadt', carregarFilaSADT);
    socket.on('atualizar_fila', carregarFilaSADT);

    return () => {
      socket.disconnect();
    };
  }, []);

  const iniciarColeta = (pedido) => {
    setExameAtual(pedido);
  };

  const finalizarExame = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/atendimentos/${exameAtual.atendimentoId}/status`, {
        status: 'AGUARDANDO_RETORNO',
      });
      setExameAtual(null);
      setResultado('');
      setLaudoPdf('');
      carregarFilaSADT();
      alert('Exame finalizado! O paciente retornou para a fila do Medico.');
    } catch (e) {
      alert('Erro ao salvar o laudo do exame. Verifique o servidor.');
    }
  };

  const getBadgeColor = (prioridade) => {
    switch (prioridade) {
      case 'Vermelho': return { bg: '#feebee', color: '#c62828' };
      case 'Amarelo': return { bg: '#fff3e0', color: '#ef6c00' };
      default: return { bg: '#e8f5e9', color: '#2e7d32' };
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={titleArea}>
          <h2 style={{ margin: 0, color: '#fff' }}>Central de Apoio Diagnostico (SADT)</h2>
        </div>
      </header>

      <main style={mainContentStyle}>
        {!exameAtual ? (
          <section style={panelWhite}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Fila de Pedidos Medicos</h3>
              <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Total de coletas pendentes: {pedidosPendentes.length}</span>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRow}>
                  <th style={thStyle}>Prioridade</th>
                  <th style={thStyle}>Paciente</th>
                  <th style={thStyle}>Procedimento</th>
                  <th style={thStyle}>Justificativa Clinica</th>
                  <th style={thStyle}>Acao</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPendentes.length === 0 ? (
                  <tr><td colSpan="5" style={emptyStateStyle}>Nenhuma solicitacao de exame pendente no momento.</td></tr>
                ) : (
                  pedidosPendentes.map(p => {
                    const badge = getBadgeColor(p.prioridade);
                    return (
                      <tr key={p.id} style={tableRow}>
                        <td style={tdStyle}>
                          <span style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.color }}>
                            {p.prioridade}
                          </span>
                        </td>
                        <td style={tdStyle}><strong>{p.paciente?.nome}</strong></td>
                        <td style={tdStyle}>
                          <div style={{ color: '#2980b9', fontWeight: '600' }}>{p.exame}</div>
                          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{p.categoria}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '14px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.justificativa}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => iniciarColeta(p)} style={btnAction}>
                            Iniciar Protocolo
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>
        ) : (
          <section style={panelWhite}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f0f2f5', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Execucao de Exame: {exameAtual.paciente?.nome}</h2>
                <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Procedimento Solicitado: <strong>{exameAtual.exame}</strong></div>
              </div>
              <button onClick={() => setExameAtual(null)} style={btnCancel}>Suspender Atendimento</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>Diretrizes Medicas</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}><strong>Justificativa:</strong> {exameAtual.justificativa}</p>
                {exameAtual.observacoes && (
                  <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#e67e22' }}><strong>Obs do Medico:</strong> {exameAtual.observacoes}</p>
                )}
              </div>
              <div style={{ borderLeft: '2px solid #dfe6e9', paddingLeft: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>Dados Operacionais</h4>
                <p style={{ margin: 0, fontSize: '14px' }}><strong>Categoria:</strong> {exameAtual.categoria}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}><strong>Prioridade:</strong> <span style={{color: getBadgeColor(exameAtual.prioridade).color, fontWeight: 'bold'}}>{exameAtual.prioridade}</span></p>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}><strong>Solicitado em:</strong> {new Date(exameAtual.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <form onSubmit={finalizarExame} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Laudo Tecnico / Resultados / Parametros Lidos</label>
                <textarea
                  placeholder="Digite o resultado completo da analise laboratorial ou o laudo do exame de imagem..."
                  value={resultado}
                  onChange={e => setResultado(e.target.value)}
                  required
                  style={{ ...inputStyle, height: '180px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Anexar PDF (Opcional - Laudo Externo/Imagens)</label>
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={e => setLaudoPdf(e.target.value)}
                  style={{ ...inputStyle, padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" style={btnSuccess}>
                  Assinar Laudo e Liberar Retorno Medico
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

const containerStyle = { minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { backgroundColor: '#2c3e50', padding: '20px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const titleArea = { display: 'flex', alignItems: 'center', gap: '15px' };
const mainContentStyle = { padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' };
const panelWhite = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const tableHeaderRow = { backgroundColor: '#f8f9fa', borderBottom: '2px solid #dfe6e9' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '13px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tableRow = { borderBottom: '1px solid #f0f2f5', transition: '0.2s' };
const tdStyle = { padding: '16px 15px', verticalAlign: 'middle' };
const emptyStateStyle = { padding: '40px', textAlign: 'center', color: '#95a5a6', fontStyle: 'italic' };
const labelStyle = { display: 'block', fontSize: '14px', color: '#34495e', marginBottom: '8px', fontWeight: '600' };
const inputStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid #dfe6e9', fontSize: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fbfcfc' };
const btnAction = { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' };
const btnSuccess = { padding: '15px 30px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: '0.2s' };
const btnCancel = { padding: '10px 20px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };