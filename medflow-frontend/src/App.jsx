import { useState, useEffect } from 'react';
import { api } from './services/api';
import ModalCadastro from './components/ModalCadastro';
import './App.css';

function App() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('recepcao');
  const [showModal, setShowModal] = useState(false);

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
  }, []);

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
            <button className="btn-new" onClick={() => setShowModal(true)}>+ Novo Agendamento</button>
            <table className="medflow-table">
              <thead>
                <tr><th>Ficha</th><th>Paciente</th><th>Convênio</th><th>Status</th></tr>
              </thead>
              <tbody>
                {atendimentos.map(item => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.paciente?.nome}</td>
                    <td>{item.convenio}</td>
                    <td><span className="status-tag">{item.status}</span></td>
                  </tr>
                ))}
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

        {/* CHAMANDO O COMPONENTE MODAL DE FORA */}
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

export default App;