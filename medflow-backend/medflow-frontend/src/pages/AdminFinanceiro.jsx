import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminFinanceiro() {
  const [atendimentos, setAtendimentos] = useState([]);

  useEffect(() => {
    const carregarFinanceiro = async () => {
      try {
        const res = await api.get('/atendimentos');
        const finalizados = (res.data.dados || res.data || []).filter(a => a.status === 'FINALIZADO');
        setAtendimentos(finalizados);
      } catch (e) {
        console.error(e);
      }
    };
    carregarFinanceiro();
  }, []);

  const VALOR_PARTICULAR = 250;
  const VALOR_CONVENIO = 100;

  const qtdParticular = atendimentos.filter(a => a.convenio === 'PARTICULAR').length;
  const qtdConvenio = atendimentos.filter(a => a.convenio !== 'PARTICULAR').length;

  const totalParticular = qtdParticular * VALOR_PARTICULAR;
  const totalConvenio = qtdConvenio * VALOR_CONVENIO;
  const faturamentoBruto = totalParticular + totalConvenio;

  const repasseMedico = faturamentoBruto * 0.60;
  const lucroLiquidoClinica = faturamentoBruto * 0.40;

  return (
    <div className="admin-container">
      <main className="content" style={{ padding: '40px', width: '100%' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#2c3e50', margin: 0 }}>💸 Motor Financeiro</h1>
          <p style={{ color: '#7f8c8d' }}>Gestão de Faturamento e Repasses Médicos</p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ ...cardStyle, borderLeft: '5px solid #27ae60' }}>
            <h4 style={cardTitleStyle}>Faturamento Bruto</h4>
            <h2 style={{ ...cardValueStyle, color: '#27ae60' }}>R$ {faturamentoBruto.toFixed(2)}</h2>
          </div>
          
          <div style={{ ...cardStyle, borderLeft: '5px solid #2980b9' }}>
            <h4 style={cardTitleStyle}>Caixa (Particular)</h4>
            <h2 style={{ ...cardValueStyle, color: '#2980b9' }}>R$ {totalParticular.toFixed(2)}</h2>
          </div>

          <div style={{ ...cardStyle, borderLeft: '5px solid #f39c12' }}>
            <h4 style={cardTitleStyle}>A Receber (Convênios)</h4>
            <h2 style={{ ...cardValueStyle, color: '#f39c12' }}>R$ {totalConvenio.toFixed(2)}</h2>
          </div>

          <div style={{ ...cardStyle, borderLeft: '5px solid #8e44ad' }}>
            <h4 style={cardTitleStyle}>Repasse Médico (60%)</h4>
            <h2 style={{ ...cardValueStyle, color: '#8e44ad' }}>R$ {repasseMedico.toFixed(2)}</h2>
          </div>
        </section>

        <section style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Extrato de Atendimentos Faturados</h3>
          <table className="medflow-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                <th style={thStyle}>Ficha / Paciente</th>
                <th style={thStyle}>Data Finalização</th>
                <th style={thStyle}>Fonte Pagadora</th>
                <th style={thStyle}>Valor Bruto</th>
                <th style={thStyle}>Retenção Clínica (40%)</th>
                <th style={thStyle}>Comissão (60%)</th>
              </tr>
            </thead>
            <tbody>
              {atendimentos.map(a => {
                const valor = a.convenio === 'PARTICULAR' ? VALOR_PARTICULAR : VALOR_CONVENIO;
                const dataFechamento = new Date(a.updatedAt).toLocaleString();
                
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>
                      <strong>#{a.id.substring(0, 5).toUpperCase()}</strong><br/>
                      <small>{a.paciente?.nome || 'Paciente'}</small>
                    </td>
                    <td style={tdStyle}>{dataFechamento}</td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        background: a.convenio === 'PARTICULAR' ? '#e8f8f5' : '#fef5e7',
                        color: a.convenio === 'PARTICULAR' ? '#16a085' : '#d35400' 
                      }}>
                        {a.convenio}
                      </span>
                    </td>
                    <td style={tdStyle}>R$ {valor.toFixed(2)}</td>
                    <td style={{ ...tdStyle, color: '#27ae60', fontWeight: 'bold' }}>R$ {(valor * 0.4).toFixed(2)}</td>
                    <td style={{ ...tdStyle, color: '#8e44ad', fontWeight: 'bold' }}>R$ {(valor * 0.6).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const cardTitleStyle = { margin: '0 0 10px 0', fontSize: '14px', color: '#7f8c8d', textTransform: 'uppercase' };
const cardValueStyle = { margin: 0, fontSize: '24px' };
const thStyle = { padding: '12px', borderBottom: '2px solid #ddd', color: '#2c3e50' };
const tdStyle = { padding: '12px', verticalAlign: 'middle' };