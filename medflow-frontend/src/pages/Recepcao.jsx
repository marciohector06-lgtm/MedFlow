import { useState, useEffect } from 'react';
import { api } from '../services/api';
import ModalCadastro from '../components/ModalCadastro';
import { io } from 'socket.io-client';

export default function Recepcao() {
  const [atendimentos, setAtendimentos] = useState({
    aguardando: [],
    emAtendimento: [],
    finalizado: []
  });

  const [modalConsulta, setModalConsulta] = useState(false);
  const [modalExame, setModalExame] = useState(false);
  const [modalNovoPaciente, setModalNovoPaciente] = useState(false);

  const [formConsulta, setFormConsulta] = useState({
    cpf: '', pacienteNome: '', celular: '',
    cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '',
    convenio: 'PARTICULAR', medicoResponsavel: '', data: '', hora: '', motivo: '', encaixe: false
  });

  const [formExame, setFormExame] = useState({
    cpf: '', pacienteNome: '', celular: '',
    cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '',
    convenio: 'PARTICULAR', tipoExame: '', data: '', preparo: ''
  });

  const carregarKanban = async () => {
    try {
      const res = await api.get('/atendimentos');
      const dados = res.data.dados || res.data || [];

      setAtendimentos({
        aguardando: dados.filter(a => a.status === 'ABERTO' || a.status === 'AGUARDANDO_TRIAGEM' || a.status === 'AGENDADO'),
        emAtendimento: dados.filter(a => a.status === 'AGUARDANDO_ATENDIMENTO' || a.status === 'EM_CONSULTA' || a.status === 'AGUARDANDO_EXAME'),
        finalizado: dados.filter(a => a.status === 'FINALIZADO')
      });
    } catch (e) {
    }
  };

  useEffect(() => {
    carregarKanban();

    const socket = io(api.defaults.baseURL || 'http://localhost:3333');

    socket.on('novo_atendimento', carregarKanban);
    socket.on('atualizar_fila', carregarKanban);
    socket.on('status_atualizado', carregarKanban);

    return () => {
      socket.disconnect();
    };
  }, []);

  const buscarPacientePorCpf = async (cpfDigitado, tipo) => {
    const cpf = cpfDigitado.replace(/\D/g, '');
    if (cpf.length === 11) {
      try {
        const res = await api.get(`/pacientes/${cpf}`);
        if (res.data) {
          const p = res.data;
          if (tipo === 'consulta') {
            setFormConsulta(prev => ({
              ...prev,
              pacienteNome: p.nome || '',
              celular: p.whatsapp || '',
              cep: p.cep || '',
              endereco: p.endereco || '',
              numero: p.numero || '',
              bairro: p.bairro || '',
              cidade: p.cidade || '',
              uf: p.uf || ''
            }));
          } else {
            setFormExame(prev => ({
              ...prev,
              pacienteNome: p.nome || '',
              celular: p.whatsapp || '',
              cep: p.cep || '',
              endereco: p.endereco || '',
              numero: p.numero || '',
              bairro: p.bairro || '',
              cidade: p.cidade || '',
              uf: p.uf || ''
            }));
          }
        }
      } catch (error) {
      }
    }
  };

  const salvarConsulta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atendimentos', {
        nome: formConsulta.pacienteNome,
        cpf: formConsulta.cpf.replace(/\D/g, ''),
        whatsapp: formConsulta.celular.replace(/\D/g, ''),
        cep: formConsulta.cep,
        endereco: formConsulta.endereco,
        numero: formConsulta.numero,
        bairro: formConsulta.bairro,
        cidade: formConsulta.cidade,
        uf: formConsulta.uf,
        convenio: formConsulta.convenio,
        status: 'AGENDADO'
      });
      setModalConsulta(false);
      setFormConsulta({ cpf: '', pacienteNome: '', celular: '', cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '', convenio: 'PARTICULAR', medicoResponsavel: '', data: '', hora: '', motivo: '', encaixe: false });
      carregarKanban();
    } catch (e) {
    }
  };

  const salvarExame = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atendimentos', {
        nome: formExame.pacienteNome,
        cpf: formExame.cpf.replace(/\D/g, ''),
        whatsapp: formExame.celular.replace(/\D/g, ''),
        cep: formExame.cep,
        endereco: formExame.endereco,
        numero: formExame.numero,
        bairro: formExame.bairro,
        cidade: formExame.cidade,
        uf: formExame.uf,
        convenio: formExame.convenio,
        status: 'AGENDADO'
      });
      setModalExame(false);
      setFormExame({ cpf: '', pacienteNome: '', celular: '', cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '', convenio: 'PARTICULAR', tipoExame: '', data: '', preparo: '' });
      carregarKanban();
    } catch (e) {
    }
  };

  const excluirAtendimento = async (id) => {
    const confirmar = window.confirm('Deseja excluir este paciente da fila?');
    if (confirmar) {
      try {
        await api.delete(`/atendimentos/${id}`);
        carregarKanban();
      } catch (e) {
      }
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={titleArea}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Recepção</h2>
        </div>
        <div style={actionGroup}>
          <button onClick={() => setModalConsulta(true)} style={btnSecondary}>Marcar Consulta</button>
          <button onClick={() => setModalExame(true)} style={btnSecondary}>Agendar Exame</button>
          <button onClick={() => setModalNovoPaciente(true)} style={btnPrimary}>+ Novo Paciente</button>
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
                  <div style={actionCardGroup}>
                    <small style={{ color: '#7f8c8d' }}>Chegou: {new Date(a.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                    <button onClick={() => excluirAtendimento(a.id)} style={btnExcluir}>Excluir</button>
                  </div>
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
                  <div style={actionCardGroup}>
                    <button onClick={() => excluirAtendimento(a.id)} style={btnExcluir}>Excluir</button>
                  </div>
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
                  <div style={actionCardGroup}>
                    <button onClick={() => excluirAtendimento(a.id)} style={btnExcluir}>Excluir</button>
                  </div>
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
                
                <h4 style={sectionTitle}>1. Buscar Paciente</h4>
                <div style={fullWidth}>
                  <label style={labelStyle}>CPF (Digite para autocompletar)</label>
                  <input type="text" placeholder="Apenas numeros" value={formConsulta.cpf} onChange={e => setFormConsulta({...formConsulta, cpf: e.target.value.replace(/\D/g, '').slice(0, 11)})} onBlur={(e) => buscarPacientePorCpf(e.target.value, 'consulta')} required style={{...inputStyle, border: '2px solid #3498db'}} />
                </div>

                <h4 style={sectionTitle}>2. Dados Cadastrais (Editaveis)</h4>
                <div style={fullWidth}>
                  <label style={labelStyle}>Nome Completo</label>
                  <input type="text" value={formConsulta.pacienteNome} onChange={e => setFormConsulta({...formConsulta, pacienteNome: e.target.value})} required style={inputStyle} />
                </div>
                
                <div>
                  <label style={labelStyle}>Celular (WhatsApp)</label>
                  <input type="text" placeholder="(00) 00000-0000" value={formConsulta.celular} onChange={e => setFormConsulta({...formConsulta, celular: e.target.value})} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>CEP</label>
                  <input type="text" value={formConsulta.cep} onChange={e => setFormConsulta({...formConsulta, cep: e.target.value})} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={labelStyle}>Endereco</label>
                  <input type="text" value={formConsulta.endereco} onChange={e => setFormConsulta({...formConsulta, endereco: e.target.value})} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Numero</label>
                  <input type="text" value={formConsulta.numero} onChange={e => setFormConsulta({...formConsulta, numero: e.target.value})} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Bairro</label>
                  <input type="text" value={formConsulta.bairro} onChange={e => setFormConsulta({...formConsulta, bairro: e.target.value})} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Cidade / UF</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="text" value={formConsulta.cidade} onChange={e => setFormConsulta({...formConsulta, cidade: e.target.value})} style={{...inputStyle, flex: 3}} />
                    <input type="text" value={formConsulta.uf} onChange={e => setFormConsulta({...formConsulta, uf: e.target.value})} style={{...inputStyle, flex: 1}} maxLength="2" />
                  </div>
                </div>

                <h4 style={sectionTitle}>3. Dados do Agendamento</h4>
                <div>
                  <label style={labelStyle}>Convenio</label>
                  <select value={formConsulta.convenio} onChange={e => setFormConsulta({...formConsulta, convenio: e.target.value})} required style={inputStyle}>
                    <option value="PARTICULAR">Particular</option>
                    <option value="GDF SAUDE">GDF Saude</option>
                    <option value="SULAMERICA">SulAmerica</option>
                    <option value="BRADESCO">Bradesco Saude</option>
                  </select>
                </div>

                <div style={fullWidth}>
                  <label style={labelStyle}>Medico / Especialidade</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select value={formConsulta.medicoResponsavel} onChange={e => setFormConsulta({...formConsulta, medicoResponsavel: e.target.value})} required style={{...inputStyle, flex: 1}}>
                      <option value="">Selecione o Profissional</option>
                      <option value="Dra. Nadyla (Clinico Geral)">Dra. Nadyla (Clinico Geral)</option>
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
                  <label style={labelStyle}>Procedimento / Observacoes</label>
                  <input type="text" placeholder="Ex: Retorno, Primeira Consulta, Avaliacao" value={formConsulta.motivo} onChange={e => setFormConsulta({...formConsulta, motivo: e.target.value})} required style={inputStyle} />
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

                <h4 style={sectionTitle}>1. Buscar Paciente</h4>
                <div style={fullWidth}>
                  <label style={labelStyle}>CPF (Digite para autocompletar)</label>
                  <input type="text" placeholder="Apenas numeros" value={formExame.cpf} onChange={e => setFormExame({...formExame, cpf: e.target.value.replace(/\D/g, '').slice(0, 11)})} onBlur={(e) => buscarPacientePorCpf(e.target.value, 'exame')} required style={{...inputStyle, border: '2px solid #3498db'}} />
                </div>

                <h4 style={sectionTitle}>2. Dados Cadastrais (Editaveis)</h4>
                <div style={fullWidth}>
                  <label style={labelStyle}>Nome do Paciente</label>
                  <input type="text" value={formExame.pacienteNome} onChange={e => setFormExame({...formExame, pacienteNome: e.target.value})} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Celular (WhatsApp)</label>
                  <input type="text" placeholder="(00) 00000-0000" value={formExame.celular} onChange={e => setFormExame({...formExame, celular: e.target.value})} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>CEP</label>
                  <input type="text" value={formExame.cep} onChange={e => setFormExame({...formExame, cep: e.target.value})} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={labelStyle}>Endereco</label>
                  <input type="text" value={formExame.endereco} onChange={e => setFormExame({...formExame, endereco: e.target.value})} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Numero</label>
                  <input type="text" value={formExame.numero} onChange={e => setFormExame({...formExame, numero: e.target.value})} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Bairro</label>
                  <input type="text" value={formExame.bairro} onChange={e => setFormExame({...formExame, bairro: e.target.value})} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Cidade / UF</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="text" value={formExame.cidade} onChange={e => setFormExame({...formExame, cidade: e.target.value})} style={{...inputStyle, flex: 3}} />
                    <input type="text" value={formExame.uf} onChange={e => setFormExame({...formExame, uf: e.target.value})} style={{...inputStyle, flex: 1}} maxLength="2" />
                  </div>
                </div>

                <h4 style={sectionTitle}>3. Dados do Exame</h4>
                <div>
                  <label style={labelStyle}>Convenio</label>
                  <select value={formExame.convenio} onChange={e => setFormExame({...formExame, convenio: e.target.value})} required style={inputStyle}>
                    <option value="PARTICULAR">Particular</option>
                    <option value="GDF SAUDE">GDF SAude</option>
                    <option value="SULAMERICA">SulAmerica</option>
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
                  <label style={labelStyle}>Preparo / Recomendacoes</label>
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

      {modalNovoPaciente && (
        <ModalCadastro 
          fecharModal={() => setModalNovoPaciente(false)} 
          atualizarFila={carregarKanban} 
        />
      )}
    </div>
  );
}

const containerStyle = { minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const titleArea = { display: 'flex', alignItems: 'center', gap: '10px' };
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
const actionCardGroup = { display: 'flex', alignItems: 'center', gap: '10px' };
const btnExcluir = { padding: '4px 8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const modalGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' };
const fullWidth = { gridColumn: '1 / -1' };
const sectionTitle = { gridColumn: '1 / -1', margin: '15px 0 5px 0', color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '5px', fontSize: '15px' };
const labelStyle = { display: 'block', fontSize: '13px', color: '#7f8c8d', marginBottom: '5px', fontWeight: '600' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fbfcfc' };
const actionGroupModal = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '20px' };