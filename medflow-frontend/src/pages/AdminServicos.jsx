import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminServicos() {
  const [servicos, setServicos] = useState([]);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('CONSULTA');

  const carregarServicos = async () => {
    try {
      const res = await api.get('/servicos');
      setServicos(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { carregarServicos(); }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/servicos', { nome, valor, categoria });
      setNome(''); setValor('');
      carregarServicos();
    } catch (e) { alert('Erro ao salvar'); }
  };

  return (
    <div className="admin-container">
      <main className="content" style={{ padding: '40px' }}>
        <section className="panel">
          <h2> Tabela de Preços e Serviços</h2>
          <form onSubmit={handleSalvar} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginTop: '20px' }}>
            <input type="text" placeholder="Nome do Serviço (Ex: Raio-X)" value={nome} onChange={e => setNome(e.target.value)} required style={inputStyle} />
            <input type="number" step="0.01" placeholder="Valor R$" value={valor} onChange={e => setValor(e.target.value)} required style={inputStyle} />
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={inputStyle}>
              <option value="CONSULTA">CONSULTA</option>
              <option value="EXAME">EXAME</option>
              <option value="PROCEDIMENTO">PROCEDIMENTO</option>
            </select>
            <button type="submit" style={btnStyle}>Cadastrar</button>
          </form>
        </section>

        <section className="panel" style={{ marginTop: '20px' }}>
          <table className="medflow-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Categoria</th>
                <th>Preço Base</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map(s => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                  <td><span className="status-tag" style={{ background: '#9b59b6' }}>{s.categoria}</span></td>
                  <td style={{ fontWeight: 'bold', color: '#27ae60' }}>R$ {s.valor.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '4px', border: '1px solid #ddd' };
const btnStyle = { padding: '12px 24px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };