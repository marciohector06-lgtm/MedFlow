import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('RECEPCIONISTA');

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', { nome, email, senha, cargo });
      setNome(''); setEmail(''); setSenha('');
      carregarUsuarios();
    } catch (e) {
      alert('Erro ao cadastrar usuário');
    }
  };

  const removerUsuario = async (id) => {
    if (!confirm('Deseja realmente remover este acesso?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      carregarUsuarios();
    } catch (e) {
      alert('Erro ao remover');
    }
  };

  return (
    <div className="admin-container">
      <main className="content" style={{ padding: '40px' }}>
        <section className="panel">
          <h2>👥 Gestão da Equipe</h2>
          <form onSubmit={handleCadastrar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', marginTop: '20px' }}>
            <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required style={inputStyle} />
            <select value={cargo} onChange={e => setCargo(e.target.value)} style={inputStyle}>
              <option value="ADMIN">ADMIN</option>
              <option value="RECEPCIONISTA">RECEPCIONISTA</option>
              <option value="MEDICO">MÉDICO</option>
            </select>
            <button type="submit" style={btnStyle}>Adicionar</button>
          </form>
        </section>

        <section className="panel" style={{ marginTop: '20px' }}>
          <table className="medflow-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cargo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td><span className="status-tag" style={{ background: '#34495e' }}>{u.cargo}</span></td>
                  <td>
                    <button onClick={() => removerUsuario(u.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ddd' };
const btnStyle = { padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };