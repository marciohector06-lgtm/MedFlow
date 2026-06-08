import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

export default function PainelMedico() {
  const [abaAtiva, setAbaAtiva] = useState('consultorio');
  const [fila, setFila] = useState([]);
  const [historicoTotal, setHistoricoTotal] = useState([]);
  
  const [pacienteAtual, setPacienteAtual] = useState({
    id: '77712345',
    paciente: { nome: 'João da Silva (Teste UI)' },
    convenio: 'Unimed'
  });
  
  const [filtroBusca, setFiltroBusca] = useState('');
  const [detalheHistorico, setDetalheHistorico] = useState(null);
  const [modalSADT, setModalSADT] = useState(false);
  
  const [relatorio, setRelatorio] = useState('');

  const [ficha, setFicha] = useState({
    sexo: '', acompanhante: '', tipoAtendimento: '1º Atendimento',
    queixa: '', tempoValor: '', tempoUnidade: 'dias', carater: '', sintomasAssoc: '',
    sinaisAlarme: [], morbidades: [], alergias: 'Nega alergias',
    medicamentos: '', vitais: { pa: '', fc: '', sat: '', temp: '' },
    exameFisico: [], impressao: '', observacao: '', condutaTab: 'Alta', condutas: []
  });

  const [formSADT, setFormSADT] = useState({
    categoria: '', exame: '', prioridade: 'Verde', justificativa: '', observacoes: ''
  });

  const examesDisponiveis = {
    Laboratoriais: ['Hemograma Completo', 'Glicemia de Jejum', 'Colesterol Total e Fracoes', 'TSH e T4 Livre', 'Urina Tipo I (EAS)'],
    Imagem: ['Raio-X de Torax (PA e Perfil)', 'Tomografia Computadorizada de Cranio', 'Ressonancia Magnetica de Coluna', 'Ultrassonografia de Abdome Total'],
    Cardiologico: ['Eletrocardiograma (ECG)', 'Ecocardiograma Transtoracico', 'Holter 24h', 'Teste Ergometrico']
  };

  const condutasAltaList = [
    "Prescrevo sintomáticos para uso domiciliar, com orientações e efeitos colaterais",
    "Atestado médico com autorização de divulgação de CID",
    "Solicito exame complementar ambulatorial",
    "Encaminho ao ambulatório de especialidades",
    "Oriento paciente, sano dúvidas, reforço sinais de alarme que, se presentes, devem motivar retorno imediato ao pronto-socorro para reavaliação médica."
  ];

  const condutasInternacaoList = [
    "Antibioticoterapia endovenosa",
    "Controle álgico",
    "Vigilância clínica e avaliação com especialista",
    "Solicito vaga de UTI"
  ];

  const mascaraPA = (valor) => {
    return valor.replace(/\D/g, '').replace(/(\d{3})(\d{1,2})/, '$1/$2').replace(/(\d{2})(\d{2})/, '$1/$2').substring(0, 7);
  };

  const carregarFila = async () => {
    try {
      const res = await api.get('/atendimentos');
      const listaTotal = res.data.dados || res.data || [];
      const emConsulta = listaTotal.find(item => item.status === 'EM_CONSULTA');
      
      if(emConsulta && !pacienteAtual?.id?.includes('777')) {
         setPacienteAtual(emConsulta);
      }
      
      setFila(listaTotal.filter(item => item.status === 'AGUARDANDO_ATENDIMENTO'));
      setHistoricoTotal(listaTotal.filter(item => item.status === 'FINALIZADO'));
    } catch (e) {
    }
  };

  useEffect(() => {
    carregarFila();
    const socket = io(api.defaults.baseURL || 'http://localhost:3333');
    socket.on('novo_atendimento', carregarFila);
    socket.on('atualizar_fila', carregarFila);
    socket.on('status_atualizado', carregarFila);
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    let txt = "";
    if (ficha.queixa) txt += `HDA:\nPaciente refere ${ficha.queixa}`;
    if (ficha.tempoValor) txt += ` há ${ficha.tempoValor} ${ficha.tempoUnidade}.`;
    if (ficha.carater) txt += ` Caráter: ${ficha.carater}.`;
    if (ficha.sintomasAssoc) txt += ` Sintomas associados: ${ficha.sintomasAssoc}.`;
    if (ficha.sinaisAlarme.length > 0) txt += `\nSINAIS DE ALARME: ${ficha.sinaisAlarme.join(', ')}.`;
    
    txt += `\n\nANTECEDENTES:\nMorbidades: ${ficha.morbidades.length > 0 ? ficha.morbidades.join(', ') : 'Nega'}.`;
    txt += ` Alergias: ${ficha.alergias}.`;
    if (ficha.medicamentos) txt += ` Uso contínuo: ${ficha.medicamentos}.`;

    txt += `\n\nEXAME FÍSICO:\nPA: ${ficha.vitais.pa || '--'} mmHg | FC: ${ficha.vitais.fc || '--'} bpm | SpO2: ${ficha.vitais.sat || '--'} % | Temp: ${ficha.vitais.temp || '--'} ºC`;
    if (ficha.exameFisico.length > 0) txt += `\nSistemas s/ alt: ${ficha.exameFisico.join(', ')}.`;

    if (ficha.impressao) txt += `\n\nIMPRESSÃO CLÍNICA:\n${ficha.impressao} ${ficha.observacao ? '(' + ficha.observacao + ')' : ''}`;
    
    if (ficha.condutas.length > 0) {
      txt += `\n\nCONDUTA:\n`;
      ficha.condutas.forEach(c => txt += `• ${c}\n`);
    }

    setRelatorio(txt.trim());
  }, [ficha]);

  const toggleArray = (field, value) => {
    setFicha(prev => {
      const arr = prev[field] || [];
      if (arr.includes(value)) return { ...prev, [field]: arr.filter(i => i !== value) };
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const chamarPaciente = async (paciente) => {
    try {
      await api.put(`/atendimentos/${paciente.id}/status`, { status: 'EM_CONSULTA' });
      setPacienteAtual(paciente);
      setFicha({
        sexo: '', acompanhante: '', tipoAtendimento: '1º Atendimento', queixa: '', tempoValor: '', tempoUnidade: 'dias', carater: '', sintomasAssoc: '', sinaisAlarme: [], morbidades: [], alergias: 'Nega alergias', medicamentos: '', vitais: { pa: '', fc: '', sat: '', temp: '' }, exameFisico: [], impressao: '', observacao: '', condutaTab: 'Alta', condutas: []
      });
      carregarFila();
    } catch (error) {
      toast.error("Erro ao chamar o paciente. Verifique o servidor.");
    }
  };

  const finalizarAtendimento = async () => {
    if (!pacienteAtual) return;
    try {
      if (!pacienteAtual.id.includes('777')) {
        await api.put(`/atendimentos/${pacienteAtual.id}/status`, { 
          status: 'FINALIZADO',
          sintomas: relatorio,
          diagnostico: ficha.impressao,
          prescricao: ficha.condutas.join(', ')
        });
      }
      setPacienteAtual(null);
      carregarFila();
      toast.success("Atendimento finalizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao finalizar atendimento.");
    }
  };

  const abrirModalExame = () => {
    setModalSADT(true);
  };

  const fecharModalExame = () => {
    setModalSADT(false);
    setFormSADT({ categoria: '', exame: '', prioridade: 'Verde', justificativa: '', observacoes: '' });
  };

  const handleSalvarExame = async (e) => {
    e.preventDefault();
    if (!formSADT.exame || !formSADT.justificativa) return toast.error("Preencha o exame e a justificativa clínica.");
    try {
      if (!pacienteAtual.id.includes('777')) {
        await api.post(`/atendimentos/${pacienteAtual.id}/exames`, formSADT);
        await api.put(`/atendimentos/${pacienteAtual.id}/status`, { status: 'AGUARDANDO_EXAME' });
      }
      toast.success("Pedido gerado com sucesso! Paciente encaminhado.");
      setModalSADT(false);
      setPacienteAtual(null);
      carregarFila();
    } catch (error) {
      toast.error("Erro ao gerar pedido de exame.");
    }
  };

  const copiarTexto = () => {
    navigator.clipboard.writeText(relatorio);
    toast.success('Prontuário copiado!');
  };

  const historicoFiltrado = historicoTotal.filter(h => 
    h.paciente?.nome.toLowerCase().includes(filtroBusca.toLowerCase()) || 
    h.paciente?.cpf.includes(filtroBusca.replace(/\D/g, ''))
  );

  const renderPill = (field, value, label = value) => {
    const isActive = Array.isArray(ficha[field]) ? ficha[field].includes(value) : ficha[field] === value;
    return (
      <button 
        key={value}
        onClick={() => Array.isArray(ficha[field]) ? toggleArray(field, value) : setFicha({...ficha, [field]: value})}
        style={isActive ? btnPillActive : btnPill}
      >
        {label}
      </button>
    );
  };

  const renderTab = (field, value, label = value) => {
    const isActive = ficha[field] === value;
    return (
      <div key={value} onClick={() => setFicha({...ficha, [field]: value, condutas: []})} style={isActive ? btnTabActive : btnTab}>
        {label}
      </div>
    );
  };

  return (
    <div className="admin-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Toaster position="top-right" />
      
      <aside className="sidebar" style={{ width: '250px', backgroundColor: '#1a252f', color: '#fff', flexShrink: 0 }}>
        <div className="logo-section" style={{ padding: '20px', display: 'flex', justifyContent: 'center', backgroundColor: '#2c3e50', borderBottom: '1px solid #1a252f' }}>
          <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px' }}>MENU MEDICO</h2>
        </div>
        <nav className="menu-nav" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column' }}>
          <button style={{...menuBtnStyle, ...(abaAtiva === 'consultorio' ? menuBtnActiveStyle : {})}} onClick={() => setAbaAtiva('consultorio')}>Consultorio</button>
          <button style={{...menuBtnStyle, ...(abaAtiva === 'historico' ? menuBtnActiveStyle : {})}} onClick={() => setAbaAtiva('historico')}>Historico</button>
        </nav>
      </aside>

      <main className="content" style={{ flex: 1, backgroundColor: '#f1f5f9', overflowY: 'auto', padding: '0' }}>
        <header className="content-header" style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '22px' }}>{abaAtiva === 'consultorio' ? 'PAINEL MEDICO' : 'HISTORICO CLINICO'}</h1>
          <div className="user-info">Medico: <strong>Dr. Marcio Henrique</strong></div>
        </header>

        <div style={{ padding: '30px' }}>
            {abaAtiva === 'consultorio' && (
            <>
                {!pacienteAtual && (
                <section className="panel" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '20px' }}>Pacientes Aguardando Atendimento</h3>
                    <table className="medflow-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Ficha</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Paciente</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Convenio</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Acao</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fila.length === 0 ? (
                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>Consultorio vazio. Nenhum paciente na fila.</td></tr>
                        ) : (
                        fila.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>#{item.id.substring(0,5).toUpperCase()}</td>
                            <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{item.paciente?.nome || item.nome || 'Paciente Externo'}</td>
                            <td style={{ padding: '12px', fontSize: '14px', color: '#475569' }}>{item.convenio}</td>
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => chamarPaciente(item)} style={{ padding: '8px 16px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Chamar</button>
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                </section>
                )}

                {pacienteAtual && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '25px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={boxStyle}>
                        <div style={boxHeader}><i className="fa-solid fa-user" style={{marginRight: '8px'}}></i> IDENTIFICAÇÃO</div>
                        <div style={boxBody}>
                        <div style={row}>
                            <div style={{flex: 1}}>
                            <label style={label}>Nº DO ATENDIMENTO / INICIAIS</label>
                            <input type="text" style={input} value={`#${pacienteAtual.id.substring(0,5).toUpperCase()} - ${pacienteAtual.paciente?.nome || pacienteAtual.nome}`} readOnly />
                            </div>
                        </div>
                        <div style={row}>
                            <div>
                            <label style={label}>IDADE</label>
                            <input type="text" style={{...input, width: '80px'}} value="28" readOnly />
                            </div>
                            <div>
                            <label style={label}>SEXO</label>
                            <div style={pillGroup}>
                                {renderPill('sexo', 'M')}
                                {renderPill('sexo', 'F')}
                            </div>
                            </div>
                        </div>
                        <div style={row}>
                            <div style={{width: '100%'}}>
                            <label style={label}>ACOMPANHANTE</label>
                            <div style={pillGroup}>
                                {['Sem acompanhante', 'Filho', 'Filha', 'Esposo', 'Esposa', 'Mãe', 'Pai', 'Outro'].map(p => renderPill('acompanhante', p))}
                            </div>
                            </div>
                        </div>
                        <div style={row}>
                            <div style={{width: '100%'}}>
                            <label style={label}>TIPO DE ATENDIMENTO</label>
                            <div style={tabGroup}>
                                {renderTab('tipoAtendimento', '1º Atendimento')}
                                {renderTab('tipoAtendimento', 'Reavaliação / Alta')}
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div style={boxStyle}>
                        <div style={boxHeader}><i className="fa-solid fa-file-medical" style={{marginRight: '8px'}}></i> HISTÓRIA DA DOENÇA ATUAL</div>
                        <div style={boxBody}>
                        <div style={row}>
                            <div style={{flex: 1}}>
                            <label style={label}>QUEIXA PRINCIPAL</label>
                            <input type="text" style={input} placeholder="ex: tosse e congestão nasal..." value={ficha.queixa} onChange={e => setFicha({...ficha, queixa: e.target.value})} />
                            </div>
                        </div>
                        <div style={row}>
                            <div>
                            <label style={label}>HÁ QUANTO TEMPO</label>
                            <div style={{display: 'flex', gap: '5px'}}>
                                <input type="number" style={{...input, width: '60px'}} value={ficha.tempoValor} onChange={e => setFicha({...ficha, tempoValor: e.target.value})} />
                                {['h', 'dias', 'sem.', 'meses'].map(p => renderPill('tempoUnidade', p))}
                            </div>
                            </div>
                            <div>
                            <label style={label}>CARÁTER</label>
                            <div style={pillGroup}>
                                {['Súbito', 'Progressivo'].map(p => renderPill('carater', p))}
                            </div>
                            </div>
                        </div>
                        <div style={row}>
                            <div style={{flex: 1}}>
                            <label style={label}>SINAIS/SINTOMAS ASSOCIADOS</label>
                            <input type="text" style={input} placeholder="ex: odinofagia, mialgia..." value={ficha.sintomasAssoc} onChange={e => setFicha({...ficha, sintomasAssoc: e.target.value})} />
                            </div>
                        </div>
                        <div style={row}>
                            <div style={{width: '100%'}}>
                            <label style={{...label, color: '#e74c3c'}}><i className="fa-solid fa-triangle-exclamation"></i> SINAIS DE ALARME</label>
                            <div style={pillGroup}>
                                {['Febre', 'Dor torácica', 'Dispneia', 'Síncope/Lipotimia', 'Sangramentos', 'Alt. neurológicas', 'Vômitos incoercíveis'].map(p => renderPill('sinaisAlarme', p))}
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div style={boxStyle}>
                        <div style={boxHeader}><i className="fa-solid fa-staff-snake" style={{marginRight: '8px'}}></i> MORBIDADES / ANTECEDENTES</div>
                        <div style={boxBody}>
                        <div style={row}>
                            <div style={{width: '100%'}}>
                            <div style={pillGroup}>
                                {['Obesidade/Sobrepeso', 'HAS', 'DM2', 'DRC', 'ICC', 'DAC', 'AVC prévio', 'Tabagismo', 'Etilismo'].map(p => renderPill('morbidades', p))}
                            </div>
                            </div>
                        </div>
                        <div style={row}>
                            <div style={{width: '100%'}}>
                            <label style={label}>ALERGIAS?</label>
                            <div style={pillGroup}>
                                {['Nega alergias', 'Sim'].map(p => renderPill('alergias', p))}
                            </div>
                            </div>
                        </div>
                        <div style={row}>
                            <div style={{width: '100%'}}>
                            <label style={label}>MEDICAMENTOS EM USO</label>
                            <input type="text" style={input} placeholder="Ex: Elifore 100mg 1-0-0" value={ficha.medicamentos} onChange={e => setFicha({...ficha, medicamentos: e.target.value})} />
                            </div>
                        </div>
                        </div>
                    </div>

                    <div style={boxStyle}>
                        <div style={boxHeader}><i className="fa-solid fa-stethoscope" style={{marginRight: '8px'}}></i> EXAME FÍSICO</div>
                        <div style={boxBody}>
                        <div style={row}>
                            <div style={{width: '100%'}}>
                            <label style={label}><i className="fa-solid fa-heart-pulse"></i> SINAIS VITAIS</label>
                            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                <span style={{fontSize: '12px', fontWeight: 'bold', color: '#475569'}}>PA</span>
                                <input type="text" style={{...input, width: '80px'}} value={ficha.vitais.pa} onChange={e => setFicha({...ficha, vitais: {...ficha.vitais, pa: mascaraPA(e.target.value)}})} />
                                <span style={{fontSize: '12px', color: '#94a3b8'}}>mmHg</span>
                                
                                <span style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginLeft: '10px'}}>FC</span>
                                <input type="text" style={{...input, width: '60px'}} value={ficha.vitais.fc} onChange={e => setFicha({...ficha, vitais: {...ficha.vitais, fc: e.target.value.replace(/\D/g, '')}})} />
                                <span style={{fontSize: '12px', color: '#94a3b8'}}>bpm</span>
                                
                                <span style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginLeft: '10px'}}>SpO2</span>
                                <input type="text" style={{...input, width: '60px'}} value={ficha.vitais.sat} onChange={e => setFicha({...ficha, vitais: {...ficha.vitais, sat: e.target.value.replace(/\D/g, '')}})} />
                                <span style={{fontSize: '12px', color: '#94a3b8'}}>%</span>
                                
                                <span style={{fontSize: '12px', fontWeight: 'bold', color: '#475569', marginLeft: '10px'}}>Temp.</span>
                                <input type="text" style={{...input, width: '60px'}} value={ficha.vitais.temp} onChange={e => setFicha({...ficha, vitais: {...ficha.vitais, temp: e.target.value}})} />
                                <span style={{fontSize: '12px', color: '#94a3b8'}}>ºC</span>
                            </div>
                            </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px'}}>
                            {['ESTADO GERAL', 'CARDIOVASCULAR', 'RESPIRATÓRIO', 'ABDOME', 'EXTREMIDADES', 'NEUROLÓGICO'].map(sis => (
                            <div key={sis} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0'}}>
                                <input type="checkbox" checked={ficha.exameFisico.includes(sis)} onChange={() => toggleArray('exameFisico', sis)} style={{width: '16px', height: '16px'}} />
                                <span style={{fontSize: '12px', fontWeight: 'bold', color: '#10b981'}}>Normal</span>
                                <span style={{fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', marginLeft: '5px'}}>{sis}</span>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>

                    <div style={boxStyle}>
                        <div style={boxHeader}><i className="fa-solid fa-brain" style={{marginRight: '8px', color: '#ec4899'}}></i> IMPRESSÃO CLÍNICA / HIPÓTESE DIAGNÓSTICA</div>
                        <div style={boxBody}>
                        <div style={row}>
                            <input type="text" style={{...input, flex: 2}} placeholder="Ex: Pneumonia?" value={ficha.impressao} onChange={e => setFicha({...ficha, impressao: e.target.value})} />
                            <input type="text" style={{...input, flex: 1}} placeholder="Observação (opcional)" value={ficha.observacao} onChange={e => setFicha({...ficha, observacao: e.target.value})} />
                        </div>
                        </div>
                    </div>

                    <div style={boxStyle}>
                        <div style={boxHeader}><i className="fa-solid fa-file-prescription" style={{marginRight: '8px', color: '#f97316'}}></i> CONDUTA</div>
                        <div style={boxBody}>
                        <div style={{...tabGroup, marginBottom: '20px'}}>
                            {renderTab('condutaTab', 'Alta', '✓ Alta')}
                            {renderTab('condutaTab', 'Ainda no PS')}
                            {renderTab('condutaTab', 'Internação')}
                        </div>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            {(ficha.condutaTab === 'Alta' ? condutasAltaList : condutasInternacaoList).map(cond => (
                            <div key={cond} style={{display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: ficha.condutas.includes(cond) ? '#f0fdf4' : '#fff'}}>
                                <input type="checkbox" checked={ficha.condutas.includes(cond)} onChange={() => toggleArray('condutas', cond)} style={{width: '16px', height: '16px', marginTop: '2px'}} />
                                <span style={{fontSize: '13px', color: '#334155'}}>{cond}</span>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>

                    </div>

                    <div style={{ position: 'sticky', top: '0', height: 'calc(100vh - 100px)' }}>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '15px' }}>PRONTUÁRIO</h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <textarea 
                        value={relatorio}
                        onChange={e => setRelatorio(e.target.value)}
                        style={{ flex: 1, width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', resize: 'none', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6', color: '#334155', boxSizing: 'border-box' }}
                        placeholder="Texto gerado automaticamente — editável."
                        />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                        <button onClick={abrirModalExame} style={{ padding: '12px', backgroundColor: '#fff', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Solicitar Exame (SADT)</button>
                        <button onClick={copiarTexto} style={{ padding: '12px', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Copiar texto</button>
                        <button onClick={finalizarAtendimento} style={{ padding: '14px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Encerrar atendimento</button>
                        </div>
                    </div>
                    </div>

                </div>
                )}
            </>
            )}

            {abaAtiva === 'historico' && (
            <section className="panel" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Prontuários Finalizados</h3>
                <input type="text" placeholder="Buscar por Nome ou CPF..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '350px', fontSize: '13px' }} />
                </div>
                <table className="medflow-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Data</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Paciente</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>CPF</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Convenio</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px' }}>Acao</th>
                    </tr>
                </thead>
                <tbody>
                    {historicoFiltrado.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>Nenhum registro encontrado.</td></tr>
                    ) : (
                    historicoFiltrado.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{item.paciente?.nome}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#475569' }}>{item.paciente?.cpf}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#475569' }}>{item.convenio}</td>
                        <td style={{ padding: '12px' }}>
                            <button onClick={() => setDetalheHistorico(item)} style={{ padding: '6px 12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Ver Prontuario</button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </section>
            )}

            {detalheHistorico && (
            <div style={overlayStyle}>
                <div style={modalStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Prontuário: {detalheHistorico.paciente?.nome}</h2>
                    <button onClick={() => setDetalheHistorico(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Data do Atendimento</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>{new Date(detalheHistorico.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Relatório Médico</h4>
                    <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: '#1e293b' }}>{detalheHistorico.sintomas || 'Nao registrado'}</p>
                    </div>
                </div>
                </div>
            </div>
            )}

            {modalSADT && (
            <div style={overlayStyle}>
                <div style={modalStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Guia de Solicitação SADT</h3>
                    <button onClick={fecharModalExame} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>
                <form onSubmit={handleSalvarExame} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={label}>Prioridade</label>
                        <select value={formSADT.prioridade} onChange={e => setFormSADT({...formSADT, prioridade: e.target.value})} style={input}>
                        <option value="Verde">Verde</option>
                        <option value="Amarelo">Amarelo</option>
                        <option value="Vermelho">Vermelho</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={label}>Categoria do Exame</label>
                        <select value={formSADT.categoria} onChange={e => setFormSADT({...formSADT, categoria: e.target.value, exame: ''})} style={input} required>
                        <option value="">Selecione...</option>
                        <option value="Cardiologico">Cardiologico</option>
                        <option value="Laboratoriais">Laboratoriais</option>
                        <option value="Imagem">Imagem</option>
                        </select>
                    </div>
                    </div>
                    {formSADT.categoria && (
                    <div>
                        <label style={label}>Procedimento / Exame</label>
                        <select value={formSADT.exame} onChange={e => setFormSADT({...formSADT, exame: e.target.value})} style={input} required>
                        <option value="">Selecione o Exame Específico...</option>
                        {examesDisponiveis[formSADT.categoria].map((exameStr, index) => (
                            <option key={index} value={exameStr}>{exameStr}</option>
                        ))}
                        </select>
                    </div>
                    )}
                    <div>
                    <label style={label}>Justificativa Clínica</label>
                    <textarea rows="2" value={formSADT.justificativa} onChange={e => setFormSADT({...formSADT, justificativa: e.target.value})} style={{ ...input, resize: 'vertical' }} required />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={fecharModalExame} style={{ padding: '10px 15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
                    <button type="submit" style={{ padding: '10px 15px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Enviar ao Laboratório</button>
                    </div>
                </form>
                </div>
            </div>
            )}
        </div>
      </main>
    </div>
  );
}

const boxStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const boxHeader = { display: 'flex', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 'bold', color: '#1e3a8a', fontSize: '13px' };
const boxBody = { padding: '15px' };
const row = { display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start', flexWrap: 'wrap' };
const label = { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };
const input = { width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', color: '#1e293b', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' };
const pillGroup = { display: 'flex', flexWrap: 'wrap', gap: '8px' };
const btnPill = { padding: '6px 14px', border: '1px solid #cbd5e1', borderRadius: '20px', background: '#fff', color: '#475569', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' };
const btnPillActive = { ...btnPill, background: '#1e3a8a', color: '#fff', borderColor: '#1e3a8a' };
const tabGroup = { display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' };
const btnTab = { flex: 1, padding: '10px', borderRight: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textAlign: 'center' };
const btnTabActive = { ...btnTab, background: '#1e3a8a', color: '#fff' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', boxSizing: 'border-box' };
const menuBtnStyle = { background: 'none', border: 'none', color: '#cbd5e1', padding: '15px 20px', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '14px', borderLeft: '3px solid transparent' };
const menuBtnActiveStyle = { backgroundColor: '#2c3e50', color: '#fff', borderLeftColor: '#3b82f6', fontWeight: 'bold' };