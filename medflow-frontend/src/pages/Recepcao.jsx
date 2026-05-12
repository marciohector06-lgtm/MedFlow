import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Recepcao() {
  const [atendimentos, setAtendimentos] = useState({
    aguardando: [],
    emAtendimento: [],
    finalizado: []
  });

  const [modalConsulta, setModalConsulta] = useState(false);
  const [modalExame, setModalExame] = useState(false);

  const [formConsulta, setFormConsulta] = useState({
    pacienteNome: '',
    celular: '',
    convenio: 'PARTICULAR',
    medicoResponsavel: '',
    data: '',
    hora: '',
    motivo: '',
    encaixe: false
  });

  const [formExame, setFormExame] = useState({
    pacienteNome: '',
    celular: '',
    convenio: 'PARTICULAR',
    tipoExame: '',
    data: '',
    preparo: ''
  });

  const carregarKanban = async () => {
    try {
      const res = await api.get('/atendimentos');
      const dados = res.data.dados || res.data || [];

      setAtendimentos({
        aguardando: dados.filter(a => a.status === 'ABERTO' || a.status === 'AGUARDANDO_TRIAGEM'),
        emAtendimento: dados.filter(a => a.status === 'AGUARDANDO_ATENDIMENTO' || a.status === 'EM_CONSULTA' || a.status === 'AGUARDANDO_EXAME'),
        finalizado: dados.filter(a => a.status === 'FINALIZADO')
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarKanban();
    const interval = setInterval(carregarKanban, 10000);
    return () => clearInterval(interval);
  }, []);

  const salvarConsulta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atendimentos', {
        paciente: { nome: formConsulta.pacienteNome, telefone: formConsulta.celular },
        medico: formConsulta.medicoResponsavel,
        dataAgendamento: `${formConsulta.data}T${formConsulta.hora}:00`,
        categoria: 'CONSULTA',
        convenio: formConsulta.convenio,
        encaixe: formConsulta.encaixe,
        observacoes: formConsulta.motivo,
        status: 'AGENDADO'
      });
      setModalConsulta(false);
      setFormConsulta({ pacienteNome: '', celular: '', convenio: 'PARTICULAR', medicoResponsavel: '', data: '', hora: '', motivo: '', encaixe: false });
      carregarKanban();
      alert('Consulta agendada com sucesso!');
    } catch (e) {
      alert('Erro ao agendar consulta');
    }
  };

  const salvarExame = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atendimentos', {
        paciente: { nome: formExame.pacienteNome, telefone: formExame.celular },
        servico: { nome: formExame.tipoExame, categoria: 'EXAME' },
        dataAgendamento: `${formExame.data}T00:00:00`,
        convenio: formExame.convenio,
        observacoes: formExame.preparo,
        status: 'AGENDADO'
      });
      setModalExame(false);
      setFormExame({ pacienteNome: '', celular: '', convenio: 'PARTICULAR', tipoExame: '', data: '', preparo: '' });
      carregarKanban();
      alert('Exame agendado com sucesso!');
    } catch (e) {
      alert('Erro ao agendar exame');
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={titleArea}>
          <span style={iconStyle}>🏥</span>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Recepção MedFlow</h2>
        </div>
        <div style={actionGroup}>
          <button onClick={() => setModalConsulta(true)} style={btnSecondary}>📅 Marcar Consulta</button>
          <button onClick={() => setModalExame(true)} style={btnSecondary}>🔬 Agendar Exame</button>
          <button style={btnPrimary}>+ Novo Paciente</button>
        </div>
      </header>

      <main style={kanbanBoard}>
        <div style={kanbanColumn}>
          <div style={{...columnHeader, borderTopColor: '#f39c12'}}>
            Aguardando ({atendimentos.aguardando.length})
          </div>
          <div style={columnBody}>
            {atendimentos.aguardando.map(a => (
              <div key={a.id} style={cardStyle}>
                <strong style={{ fontSize: '15px', color: '#2c3e50' }}>{a.paciente?.nome}</strong>
                <div style={cardInfo}>
                  <span style={badgeStyle}>{a.servico?.categoria || 'GERAL'}</span>
                  <small style={{ color: '#7f8c8d' }}>Chegou: {new Date(a.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={kanbanColumn}>
          <div style={{...columnHeader, borderTopColor: '#9b59b6'}}>
            Em Atendimento ({atendimentos.emAtendimento.length})
          </div>
          <div style={columnBody}>
            {atendimentos.emAtendimento.map(a => (
              <div key={a.id} style={cardStyle}>
                <strong style={{ fontSize: '15px', color: '#2c3e50' }}>{a.paciente?.nome}</strong>
                <div style={cardInfo}>
                  <span style={{...badgeStyle, backgroundColor: '#f3e5f5', color: '#8e24aa'}}>{a.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={kanbanColumn}>
          <div style={{...columnHeader, borderTopColor: '#2ecc71'}}>
            Finalizado ({atendimentos.finalizado.length})
          </div>
          <div style={columnBody}>
            {atendimentos.finalizado.map(a => (
              <div key={a.id} style={{...cardStyle, borderLeftColor: '#2ecc71'}}>
                <strong style={{ fontSize: '15px', color: '#2c3e50' }}>{a.paciente?.nome}</strong>
                <div style={cardInfo}>
                  <span style={{...badgeStyle, backgroundColor: '#e8f8f5', color: '#16a085'}}>FINALIZADO</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalConsulta && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Agendar Consulta</h3>
            <form onSubmit={salvarConsulta} style={formStyle}>
              <div style={modalGrid}>
                <div style={fullWidth}>
                  <label style={labelStyle}>Nome do Paciente</label>
                  <input type="text" value={formConsulta.pacienteNome} onChange={e => setFormConsulta({...formConsulta, pacienteNome: e.target.value})} required style={inputStyle} />
                </div>
                
                <div>
                  <label style={labelStyle}>Celular (WhatsApp)</label>
                  <input type="text" placeholder="(00) 00000-0000" value={formConsulta.celular} onChange={e => setFormConsulta({...formConsulta, celular: e.target.value})} required style={inputStyle} />
                </div>
                
                <div>
                  <label style={labelStyle}>Convênio</label>
                  <select value={formConsulta.convenio} onChange={e => setFormConsulta({...formConsulta, convenio: e.target.value})} required style={inputStyle}>
                    <option value="PARTICULAR">Particular</option>
                    <option value="GDF SAUDE">GDF Saúde</option>
                    <option value="SULAMERICA">SulAmérica</option>
                    <option value="BRADESCO">Bradesco Saúde</option>
                  </select>
                </div>

                <div style={fullWidth}>
                  <label style={labelStyle}>Médico / Especialidade</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select value={formConsulta.medicoResponsavel} onChange={e => setFormConsulta({...formConsulta, medicoResponsavel: e.target.value})} required style={{...inputStyle, flex: 1}}>
                      <option value="">Selecione o Profissional</option>
                      <option value="Dra. Nadyla (Clínico Geral)">Dra. Nadyla (Clínico Geral)</option>
                      <option value="Dr. Carlos (Cardiologia)">Dr. Carlos (Cardiologia)</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#e67e22', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #e67e22', padding: '8px 12px', borderRadius: '6px', backgroundColor: formConsulta.encaixe ? '#fff3e0' : 'transparent' }}>
                      <input type="checkbox" checked={formConsulta.encaixe} onChange={e => setFormConsulta({...formConsulta, encaixe: e.target.checked})} />
                      Encaixe
                    </label>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Data</label>
                  <input type="date" value={formConsulta.data} onChange={e => setFormConsulta({...formConsulta, data: e.target.value})} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Hora Chegada</label>
                  <input type="time" value={formConsulta.hora} onChange={e => setFormConsulta({...formConsulta, hora: e.target.value})} required style={inputStyle} />
                </div>

                <div style={fullWidth}>
                  <label style={labelStyle}>Procedimento / Observações</label>
                  <input type="text" placeholder="Ex: Retorno, Primeira Consulta, Avaliação" value={formConsulta.motivo} onChange={e => setFormConsulta({...formConsulta, motivo: e.target.value})} required style={inputStyle} />
                </div>
              </div>
              
              <div style={actionGroupModal}>
                <button type="button" onClick={() => setModalConsulta(false)} style={btnCancel}>Cancelar</button>
                <button type="submit" style={btnPrimary}>Gravar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalExame && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Agendar Exame</h3>
            <form onSubmit={salvarExame} style={formStyle}>
              <div style={modalGrid}>
                <div style={fullWidth}>
                  <label style={labelStyle}>Nome do Paciente</label>
                  <input type="text" value={formExame.pacienteNome} onChange={e => setFormExame({...formExame, pacienteNome: e.target.value})} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Celular (WhatsApp)</label>
                  <input type="text" placeholder="(00) 00000-0000" value={formExame.celular} onChange={e => setFormExame({...formExame, celular: e.target.value})} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Convênio</label>
                  <select value={formExame.convenio} onChange={e => setFormExame({...formExame, convenio: e.target.value})} required style={inputStyle}>
                    <option value="PARTICULAR">Particular</option>
                    <option value="GDF SAUDE">GDF Saúde</option>
                    <option value="SULAMERICA">SulAmérica</option>
                  </select>
                </div>

                <div style={fullWidth}>
                  <label style={labelStyle}>Tipo de Exame</label>
                  <select value={formExame.tipoExame} onChange={e => setFormExame({...formExame, tipoExame: e.target.value})} required style={inputStyle}>
                    <option value="">Selecione o Exame</option>
                    <option value="Raio-X">Raio-X</option>
                    <option value="Eletrocardiograma">Eletrocardiograma</option>
                    <option value="Exame de Sangue">Exame de Sangue</option>
                    <option value="Ultrassonografia">Ultrassonografia</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Data do Exame</label>
                  <input type="date" value={formExame.data} onChange={e => setFormExame({...formExame, data: e.target.value})} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Preparo / Recomendações</label>
                  <input type="text" placeholder="Ex: Jejum 8h" value={formExame.preparo} onChange={e => setFormExame({...formExame, preparo: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={actionGroupModal}>
                <button type="button" onClick={() => setModalExame(false)} style={btnCancel}>Cancelar</button>
                <button type="submit" style={btnPrimary}>Gravar Exame</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const containerStyle = { minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const titleArea = { display: 'flex', alignItems: 'center', gap: '10px' };
const iconStyle = { fontSize: '24px' };
const actionGroup = { display: 'flex', gap: '12px' };
const btnPrimary = { padding: '10px 20px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' };
const btnSecondary = { padding: '10px 20px', backgroundColor: '#fff', color: '#2980b9', border: '1px solid #2980b9', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s' };
const btnCancel = { padding: '10px 20px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const kanbanBoard = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', height: 'calc(100vh - 110px)' };
const kanbanColumn = { backgroundColor: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' };
const columnHeader = { padding: '18px 20px', fontWeight: 'bold', color: '#2c3e50', borderTop: '4px solid', backgroundColor: '#fdfdfd', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottom: '1px solid #eee' };
const columnBody = { padding: '15px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8f9fa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' };
const cardStyle = { padding: '16px', border: '1px solid #eee', borderRadius: '8px', borderLeft: '4px solid #f39c12', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '10px' };
const cardInfo = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const badgeStyle = { padding: '4px 8px', backgroundColor: '#e1f5fe', color: '#0288d1', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '650px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const modalGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const fullWidth = { gridColumn: '1 / -1' };
const labelStyle = { display: 'block', fontSize: '13px', color: '#7f8c8d', marginBottom: '5px', fontWeight: '600' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fbfcfc' };
const actionGroupModal = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '20px' };