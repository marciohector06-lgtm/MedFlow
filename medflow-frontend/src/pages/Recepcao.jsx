import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ModalCadastro from '../components/ModalCadastro';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3333');

export default function Recepcao() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('recepcao');
  const [showModal, setShowModal] = useState(false);
  const [busca, setBusca] = useState('');

  const carregarDadosDoBanco = async () => {
    try {
      const res = await api.get('/atendimentos');
      const listaTotal = res.data.dados || res.data || [];
      const filaAtiva = listaTotal.filter(item => item.status !== 'FINALIZADO');
      setAtendimentos(filaAtiva);
    } catch (e) {
      console.error("Erro ao conectar com o servidor");
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();

    socket.on('atualizaKanban', () => {
      carregarDadosDoBanco();
    });

    return () => {
      socket.off('atualizaKanban');
    };
  }, []);

  const pacientesFiltrados = atendimentos.filter((atendimento) => {
    const nome = atendimento.paciente?.nome?.toLowerCase() || '';
    const cpf = atendimento.paciente?.cpf || '';
    const termoBusca = busca.toLowerCase();
    
    return nome.includes(termoBusca) || cpf.includes(termoBusca);
  });

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="logo-section"><h2>MedFlow</h2></div>
        <nav className="menu-nav">
          <button onClick={() => setAbaAtiva('recepcao')} className={abaAtiva === 'recepcao' ? 'active' : ''}>📋 Atendimento</button>
          <button onClick={() => setAbaAtiva('faturamento')} className={abaAtiva === 'faturamento' ? 'active' : ''}>💰 Faturamento</button>
          <button onClick={() => setAbaAtiva('relatorios')} className={abaAtiva === 'relatorios' ? 'active' : ''}>📊 Relatórios</button>
        </nav>
      </aside>

      <main className="content">
        <header className="content-header">
          <h1>{abaAtiva === 'recepcao' ? 'RECEPÇÃO' : 'FATURAMENTO'}</h1>
          <div className="user-info">Recepcionista: <strong>Márcio Henrique</strong></div>
        </header>

        {abaAtiva === 'recepcao' && (
          <section className="panel">
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <button className="btn-new" onClick={() => setShowModal(true)}>+ Novo Agendamento</button>
              <input 
                type="text" 
                placeholder="Buscar por Nome ou CPF..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            
            <table className="medflow-table">
              <thead>
                <tr><th>Ficha</th><th>Paciente</th><th>Convênio</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map(item => (
                    <tr key={item.id}>
                      <td>#{item.id.substring(0, 5).toUpperCase()}</td>
                      <td>{item.paciente?.nome}</td>
                      <td>{item.convenio || 'PARTICULAR'}</td>
                      <td><span className="status-tag">{item.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      Nenhum paciente na fila.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {abaAtiva === 'faturamento' && (
          <section className="panel">
            <div className="faturamento-grid">
              <div className="card-faturamento blue"><h4>Particular</h4><p>R$ 1.250,00</p></div>
              <div className="card-faturamento green"><h4>Convênios</h4><p>R$ 4.890,00</p></div>
            </div>
          </section>
        )}

        {showModal && (
          <ModalCadastro 
            fecharModal={() => setShowModal(false)} 
            atualizarFila={carregarDadosDoBanco} 
          />
        )}
      </main>
    </div>
  );
}