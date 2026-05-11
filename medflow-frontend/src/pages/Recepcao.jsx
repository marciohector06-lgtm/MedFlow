import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ModalCadastro from '../components/ModalCadastro';

export default function Recepcao() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [horaAtual, setHoraAtual] = useState(new Date());

  const carregarDados = async () => {
    try {
      const response = await api.get('/atendimentos');
      setAtendimentos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(() => setHoraAtual(new Date()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const atualizarStatus = async (id, novoStatus) => {
    setAtendimentos(prev =>
      prev.map(a => a.id === id ? { ...a, status: novoStatus } : a)
    );
    try {
      await api.put(`/atendimentos/${id}/status`, { status: novoStatus });
    } catch (error) {
      carregarDados();
    }
  };

  const onDragStart = (e, id) => {
    e.dataTransfer.setData('id', id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, novoStatus) => {
    const id = e.dataTransfer.getData('id');
    atualizarStatus(id, novoStatus);
  };

  const realizarEncaixe = () => {
    const aguardando = atendimentos.filter(a => a.status === 'AGUARDANDO');
    if (aguardando.length === 0) return;

    aguardando.sort((a, b) => {
      if (a.prioridade === b.prioridade) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return a.prioridade ? -1 : 1;
    });

    atualizarStatus(aguardando[0].id, 'EM_ATENDIMENTO');
  };

  const verificarAtraso = (dataCriacao, prioridade) => {
    const minutos = Math.floor((horaAtual - new Date(dataCriacao)) / 60000);
    const limite = prioridade ? 10 : 30;
    return minutos >= limite;
  };

  const renderColuna = (titulo, status, corPrincipal) => {
    const filtrados = atendimentos.filter(a => a.status === status);

    return (
      <div
        style={{ ...colunaStyle, borderTop: `5px solid ${corPrincipal}` }}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, status)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>{titulo} ({filtrados.length})</h3>
          {status === 'EM_ATENDIMENTO' && (
            <button onClick={realizarEncaixe} style={btnEncaixeStyle}>⚡ Encaixe</button>
          )}
        </div>

        {filtrados.map(a => {
          const isAtrasado = status === 'AGUARDANDO' && verificarAtraso(a.createdAt, a.prioridade);

          return (
            <div
              key={a.id}
              draggable
              onDragStart={(e) => onDragStart(e, a.id)}
              style={{ 
                ...cardStyle, 
                borderLeft: isAtrasado ? '5px solid #e74c3c' : `5px solid ${corPrincipal}`, 
                backgroundColor: isAtrasado ? '#fff5f5' : '#fff' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong style={{ color: '#2c3e50' }}>{a.paciente?.nome || 'Paciente Externo'}</strong>
                {isAtrasado && <span style={alertaStyle}>⚠️ Atrasado</span>}
              </div>
              <p style={{ fontSize: '13px', color: '#7f8c8d', margin: '8px 0' }}>{a.convenio}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={prioridadeStyle(a.prioridade)}>{a.prioridade ? 'ALTA' : 'NORMAL'}</span>
                <span style={{ fontSize: '11px', color: '#95a5a6', fontWeight: 'bold' }}>
                  Chegou: {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>🏥 Recepção MedFlow</h1>
        <button onClick={() => setShowModal(true)} style={btnStyle}>+ Novo Paciente</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {renderColuna('Aguardando', 'AGUARDANDO', '#f39c12')}
        {renderColuna('Em Atendimento', 'EM_ATENDIMENTO', '#3498db')}
        {renderColuna('Finalizado', 'FINALIZADO', '#2ecc71')}
      </div>

      {showModal && <ModalCadastro fecharModal={() => setShowModal(false)} atualizarFila={carregarDados} />}
    </div>
  );
}

const colunaStyle = { flex: 1, minWidth: '320px', backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '75vh' };
const cardStyle = { padding: '15px', borderRadius: '8px', marginBottom: '15px', cursor: 'grab', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', transition: 'all 0.2s ease-in-out' };
const btnStyle = { padding: '12px 24px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(41, 128, 185, 0.3)' };
const btnEncaixeStyle = { padding: '6px 12px', backgroundColor: '#8e44ad', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(142, 68, 173, 0.3)' };
const alertaStyle = { fontSize: '11px', color: '#e74c3c', fontWeight: 'bold' };
const prioridadeStyle = (alta) => ({ display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', backgroundColor: alta ? '#ffeaa7' : '#e0f7fa', color: alta ? '#d35400' : '#0097a7', textTransform: 'uppercase' });