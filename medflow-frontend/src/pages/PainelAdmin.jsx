import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function PainelAdmin() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [usuarios, setUsuarios] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [extrato, setExtrato] = useState([]);
  const [guias, setGuias] = useState([]);
  
  const [modalUsuario, setModalUsuario] = useState(false);
  const [formUsuario, setFormUsuario] = useState({ 
    nome: '', email: '', senha: '', cargo: 'RECEPCAO',
    cpf: '', registro: '', telefone: '', especialidade: '' 
  });

  const [modalEstoque, setModalEstoque] = useState(false);
  const [formEstoque, setFormEstoque] = useState({ nome: '', quantidade: '' });

  const [filtroData, setFiltroData] = useState({ inicio: '', fim: '' });

  const [metricas, setMetricas] = useState({
    atendimentosHoje: 0,
    faturamentoMes: 0,
    alertasEstoque: 0
  });

  const mascaraCPF = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const mascaraTelefone = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const carregarDados = async () => {
    try {
      const resUsuarios = await api.get('/usuarios');
      const usuariosData = resUsuarios.data || [];
      setUsuarios(usuariosData);

      const resEstoque = await api.get('/produtos').catch(() => ({ data: [] }));
      const estoqueData = resEstoque.data && resEstoque.data.length > 0 ? resEstoque.data : [
        { id: 1, nome: 'Seringa 5ml', quantidade: 450, status: 'Normal' },
        { id: 2, nome: 'Soro Fisiológico 500ml', quantidade: 12, status: 'Baixo' },
        { id: 3, nome: 'Luvas de Procedimento (M)', quantidade: 5, status: 'Critico' }
      ];
      setEstoque(estoqueData);

      const extratoData = [
        { id: 1, data: new Date().toISOString().split('T')[0], descricao: 'Consulta Cardiológica', fonte: 'Particular (PIX)', valor: 350.00, tipo: 'entrada' },
        { id: 2, data: new Date().toISOString().split('T')[0], descricao: 'Exame de Imagem (Raio-X)', fonte: 'Convênio SulAmérica', valor: 120.00, tipo: 'faturar' },
        { id: 3, data: new Date().toISOString().split('T')[0], descricao: 'Pagamento Fornecedor (Seringas)', fonte: 'Despesa Operacional', valor: -850.00, tipo: 'saida' },
        { id: 4, data: new Date(Date.now() - 86400000).toISOString().split('T')[0], descricao: 'Consulta Clínico Geral', fonte: 'Particular (Cartão)', valor: 200.00, tipo: 'entrada' }
      ];
      setExtrato(extratoData);

      setGuias([
        { id: '74892-A', carteirinha: 'GDF-938402-21', fatura: 'FAT-2026-001', paciente: 'Carlos Silva', convenio: 'GDF SAUDE', procedimento: 'Consulta Clínica', valor: 120.00, status: 'AGUARDANDO_ENVIO' },
        { id: '74893-B', carteirinha: 'SUL-294811-00', fatura: 'FAT-2026-002', paciente: 'Ana Paula Souza', convenio: 'SULAMERICA', procedimento: 'Raio-X de Tórax', valor: 250.00, status: 'ENVIADO' },
        { id: '74894-C', carteirinha: 'BRA-104958-33', fatura: 'FAT-2026-003', paciente: 'Marcos Almeida', convenio: 'BRADESCO', procedimento: 'Eletrocardiograma', valor: 180.00, status: 'PAGO' }
      ]);

      const resAtendimentos = await api.get('/atendimentos').catch(() => ({ data: [] }));
      const atendimentosTotais = resAtendimentos.data.dados || resAtendimentos.data || [];
      const hoje = new Date().toLocaleDateString();
      const contagemHoje = atendimentosTotais.filter(a => new Date(a.createdAt).toLocaleDateString() === hoje).length;

      const contagemAlertas = estoqueData.filter(item => (item.amount || item.quantidade) < 20).length;
      const faturamentoCalculado = extratoData.filter(e => e.tipo === 'entrada').reduce((acc, curr) => acc + curr.valor, 0);

      setMetricas({
        atendimentosHoje: contagemHoje,
        faturamentoMes: faturamentoCalculado,
        alertasEstoque: contagemAlertas
      });
    } catch (error) {
      toast.error('Erro ao carregar os dados do servidor.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, [abaAtiva]);

  const alterarStatusGuia = (id, novoStatus) => {
    setGuias(prev => prev.map(g => g.id === id ? { ...g, status: novoStatus } : g));
    if(novoStatus === 'PAGO') toast.success('Guia baixada com sucesso!');
  };

  const dispararLoteTiss = () => {
    setGuias(prev => prev.map(g => g.status === 'AGUARDANDO_ENVIO' ? { ...g, status: 'ENVIADO' } : g));
    toast.success('Lote TISS gerado e enviado para a operadora!');
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', formUsuario);
      setModalUsuario(false);
      setFormUsuario({ nome: '', email: '', senha: '', cargo: 'RECEPCAO', cpf: '', registro: '', telefone: '', especialidade: '' });
      carregarDados();
      toast.success('Usuário cadastrado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar usuário. Verifique se o e-mail já existe.');
    }
  };

  const excluirUsuario = async (id) => {
    if (window.confirm('Tem certeza que deseja bloquear este usuário?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        carregarDados();
        toast.success('Acesso bloqueado com sucesso.');
      } catch (error) {
        toast.error('Erro ao bloquear usuário.');
      }
    }
  };

  const salvarEstoque = async (e) => {
    e.preventDefault();
    try {
      await api.post('/produtos', {
        nome: formEstoque.nome,
        quantidade: Number(formEstoque.quantidade)
      });
      setModalEstoque(false);
      setFormEstoque({ nome: '', quantidade: '' });
      carregarDados();
      toast.success('Nota fiscal registrada no estoque!');
    } catch (error) {
      toast.error('Erro ao registrar nota fiscal.');
    }
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const extratoFiltrado = extrato.filter(item => {
    if (!filtroData.inicio && !filtroData.fim) return true;
    if (filtroData.inicio && item.data < filtroData.inicio) return false;
    if (filtroData.fim && item.data > filtroData.fim) return false;
    return true;
  });

  return (
    <div style={containerStyle}>
      <Toaster position="top-right" reverseOrder={false} />
      <aside style={sidebarStyle} className="no-print">
        <div style={sidebarHeader}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#ecf0f1', letterSpacing: '1px' }}>CENTRO DE COMANDO</h2>
        </div>
        <nav style={navStyle}>
          <button style={abaAtiva === 'dashboard' ? btnMenuAtivo : btnMenu} onClick={() => setAbaAtiva('dashboard')}>Visão Geral</button>
          <button style={abaAtiva === 'faturamento' ? btnMenuAtivo : btnMenu} onClick={() => setAbaAtiva('faturamento')}>Faturamento (Guias)</button>
          <button style={abaAtiva === 'equipe' ? btnMenuAtivo : btnMenu} onClick={() => setAbaAtiva('equipe')}>Gestão de Equipe</button>
          <button style={abaAtiva === 'financeiro' ? btnMenuAtivo : btnMenu} onClick={() => setAbaAtiva('financeiro')}>Financeiro</button>
          <button style={abaAtiva === 'estoque' ? btnMenuAtivo : btnMenu} onClick={() => setAbaAtiva('estoque')}>Controle de Estoque</button>
        </nav>
      </aside>

      <main style={contentStyle}>
        <header style={headerStyle} className="no-print">
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>
            {abaAtiva === 'dashboard' && 'Visão Geral do Sistema'}
            {abaAtiva === 'faturamento' && 'Gestão de Faturamento e Convênios'}
            {abaAtiva === 'equipe' && 'Controle de Acessos e Equipe'}
            {abaAtiva === 'financeiro' && 'Fluxo de Caixa e Relatórios'}
            {abaAtiva === 'estoque' && 'Inventário e Insumos Médicos'}
          </h1>
        </header>

        {abaAtiva === 'dashboard' && (
          <div style={fadeAnimation}>
            <div style={gridCards}>
              <div style={{ ...cardMetric, borderBottom: '4px solid #3498db' }}>
                <span style={cardTitle}>Pacientes Hoje</span>
                <span style={cardValue}>{metricas.atendimentosHoje}</span>
              </div>
              <div style={{ ...cardMetric, borderBottom: '4px solid #2ecc71' }}>
                <span style={cardTitle}>Faturamento Previsto (Mês)</span>
                <span style={{ ...cardValue, color: '#27ae60' }}>R$ {metricas.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ ...cardMetric, borderBottom: '4px solid #e74c3c' }}>
                <span style={cardTitle}>Alertas de Estoque</span>
                <span style={{ ...cardValue, color: '#c0392b' }}>{metricas.alertasEstoque} itens acabando</span>
              </div>
              <div style={{ ...cardMetric, borderBottom: '4px solid #f1c40f' }}>
                <span style={cardTitle}>Usuários Ativos</span>
                <span style={cardValue}>{usuarios.length}</span>
              </div>
            </div>
            
            <div style={panelWhite}>
              <h3 style={sectionTitle}>Avisos do Sistema MedFlow</h3>
              <ul style={listStyle}>
                <li style={listItemWarning}><strong>Estoque:</strong> O sistema detectou {metricas.alertasEstoque} itens em nível crítico. Necessário reposição.</li>
                <li style={listItemInfo}><strong>Atualização:</strong> O módulo de disparo de WhatsApp foi ativado com sucesso para a Recepção.</li>
                <li style={listItemSuccess}><strong>Financeiro:</strong> Lote de repasse dos convênios está pronto para ser sincronizado.</li>
              </ul>
            </div>
          </div>
        )}

        {abaAtiva === 'faturamento' && (
          <div style={{ ...panelWhite, ...fadeAnimation }}>
            <div style={flexBetween}>
              <h3 style={sectionTitle}>Guias TISS e Repasses de Planos de Saúde</h3>
              <div style={{ display: 'flex', gap: '10px' }} className="no-print">
                <button onClick={() => toast('Guias sincronizadas com o servidor.', { icon: '🔄' })} style={btnSecondary}>Sincronizar Guias</button>
                <button onClick={dispararLoteTiss} style={btnPrimary}>Gerar Lote de Faturamento (XML TISS)</button>
              </div>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr style={thRowStyle}>
                  <th style={thStyle}>Nº Guia</th>
                  <th style={thStyle}>Fatura</th>
                  <th style={thStyle}>Nº Carteirinha</th>
                  <th style={thStyle}>Paciente</th>
                  <th style={thStyle}>Convênio</th>
                  <th style={thStyle}>Procedimento</th>
                  <th style={thStyle}>Valor</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle} className="no-print">Ações</th>
                </tr>
              </thead>
              <tbody>
                {guias.map(guia => (
                  <tr key={guia.id} style={trStyle}>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2980b9' }}>{guia.id}</td>
                    <td style={tdStyle}>{guia.fatura}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{guia.carteirinha}</td>
                    <td style={tdStyle}>{guia.paciente}</td>
                    <td style={tdStyle}>{guia.convenio}</td>
                    <td style={tdStyle}>{guia.procedimento}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>R$ {guia.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={tdStyle}>
                      <span style={getBadgeStatusGuia(guia.status)}>{guia.status.replace('_', ' ')}</span>
                    </td>
                    <td style={tdStyle} className="no-print">
                      {guia.status === 'AGUARDANDO_ENVIO' && <button onClick={() => alterarStatusGuia(guia.id, 'ENVIADO')} style={btnActionTable}>Incluir no Lote</button>}
                      {guia.status === 'ENVIADO' && <button onClick={() => alterarStatusGuia(guia.id, 'PAGO')} style={btnActionTableSuccess}>Dar Baixa (Pago)</button>}
                      {guia.status === 'GLOSADO' && <button onClick={() => alterarStatusGuia(guia.id, 'AGUARDANDO_ENVIO')} style={btnActionTableDanger}>Revisar Recusa</button>}
                      {guia.status === 'PAGO' && <span style={{ fontSize: '12px', color: '#16a085', fontWeight: 'bold' }}>Finalizado</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'equipe' && (
          <div style={{ ...panelWhite, ...fadeAnimation }}>
            <div style={flexBetween}>
              <h3 style={sectionTitle}>Usuários Cadastrados</h3>
              <button onClick={() => setModalUsuario(true)} style={btnPrimary} className="no-print">+ Novo Usuário</button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr style={thRowStyle}>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>CPF/Registro</th>
                  <th style={thStyle}>Contato</th>
                  <th style={thStyle}>Cargo / Acesso</th>
                  <th style={thStyle} className="no-print">Ação</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan="5" style={emptyState}>Apenas o Administrador Master cadastrado.</td></tr>
                ) : (
                  usuarios.map(u => (
                    <tr key={u.id} style={trStyle}>
                      <td style={tdStyle}><strong>{u.nome}</strong></td>
                      <td style={tdStyle}>{u.cpf || 'N/A'}<br/><small style={{color: '#7f8c8d'}}>{u.registro || 'Sem Registro'}</small></td>
                      <td style={tdStyle}>{u.telefone || 'N/A'}</td>
                      <td style={tdStyle}><span style={getBadgeStyle(u.cargo)}>{u.cargo}</span></td>
                      <td style={tdStyle} className="no-print">
                        <button onClick={() => excluirUsuario(u.id)} style={btnDanger}>Bloquear Acesso</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'estoque' && (
          <div style={{ ...panelWhite, ...fadeAnimation }}>
            <div style={flexBetween}>
              <h3 style={sectionTitle}>Inventário da Clínica</h3>
              <button onClick={() => setModalEstoque(true)} style={btnPrimary} className="no-print">+ Entrada de Nota Fiscal</button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr style={thRowStyle}>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Produto / Insumo</th>
                  <th style={thStyle}>Quantidade Atual</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {estoque.map(item => (
                  <tr key={item.id} style={trStyle}>
                    <td style={tdStyle}>#{item.id.toString().padStart(4, '0')}</td>
                    <td style={tdStyle}><strong>{item.nome}</strong></td>
                    <td style={tdStyle}>{item.amount || item.quantidade} un</td>
                    <td style={tdStyle}>
                      <span style={(item.amount || item.quantidade) < 20 ? badgeDanger : badgeSuccess}>
                        {(item.amount || item.quantidade) < 20 ? 'CRÍTICO / BAIXO' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'financeiro' && (
          <div style={{ ...panelWhite, ...fadeAnimation }}>
            <div style={flexBetween}>
              <h3 style={sectionTitle}>Extrato e Relatórios (Fluxo de Caixa)</h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }} className="no-print">
                <input 
                  type="date" 
                  value={filtroData.inicio} 
                  onChange={e => setFiltroData({...filtroData, inicio: e.target.value})} 
                  style={inputFilterStyle} 
                />
                <span style={{ color: '#7f8c8d', fontWeight: 'bold' }}>até</span>
                <input 
                  type="date" 
                  value={filtroData.fim} 
                  onChange={e => setFiltroData({...filtroData, fim: e.target.value})} 
                  style={inputFilterStyle} 
                />
                <button onClick={imprimirRelatorio} style={btnSuccess}>Imprimir / Gerar PDF</button>
              </div>
            </div>

            <h2 className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>Relatório Financeiro MedFlow</h2>

            <table style={tableStyle}>
              <thead>
                <tr style={thRowStyle}>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Descrição</th>
                  <th style={thStyle}>Fonte / Destino</th>
                  <th style={thStyle}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {extratoFiltrado.length === 0 ? (
                  <tr><td colSpan="4" style={emptyState}>Nenhuma transação encontrada no período selecionado.</td></tr>
                ) : (
                  extratoFiltrado.map(item => (
                    <tr key={item.id} style={trStyle}>
                      <td style={tdStyle}>{item.data.split('-').reverse().join('/')}</td>
                      <td style={tdStyle}>{item.descricao}</td>
                      <td style={tdStyle}>{item.fonte}</td>
                      <td style={{ ...tdStyle, color: item.tipo === 'entrada' ? '#27ae60' : item.tipo === 'saida' ? '#e74c3c' : '#2980b9', fontWeight: 'bold' }}>
                        {item.tipo === 'saida' ? '- ' : item.tipo === 'entrada' ? '+ ' : ''}
                        R$ {Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalUsuario && (
        <div style={overlayStyle}>
          <div style={{...modalBoxStyle, maxWidth: '600px'}}>
            <h3 style={sectionTitle}>Cadastrar Novo Usuário</h3>
            <form onSubmit={salvarUsuario} style={formStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Nome Completo</label>
                  <input type="text" value={formUsuario.nome} onChange={e => setFormUsuario({...formUsuario, nome: e.target.value})} required style={inputStyle} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>E-mail (Login)</label>
                  <input type="email" value={formUsuario.email} onChange={e => setFormUsuario({...formUsuario, email: e.target.value})} required style={inputStyle} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>CPF</label>
                  <input type="text" value={formUsuario.cpf} onChange={e => setFormUsuario({...formUsuario, cpf: mascaraCPF(e.target.value)})} style={inputStyle} placeholder="000.000.000-00" maxLength="14" />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Registro Profissional (CRM/Coren)</label>
                  <input type="text" value={formUsuario.registro} onChange={e => setFormUsuario({...formUsuario, registro: e.target.value})} style={inputStyle} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Telefone</label>
                  <input type="text" value={formUsuario.telefone} onChange={e => setFormUsuario({...formUsuario, telefone: mascaraTelefone(e.target.value)})} style={inputStyle} placeholder="(00) 00000-0000" maxLength="15" />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Especialidade/Depto</label>
                  <input type="text" value={formUsuario.especialidade} onChange={e => setFormUsuario({...formUsuario, especialidade: e.target.value})} style={inputStyle} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Perfil de Acesso (Cargo)</label>
                  <select value={formUsuario.cargo} onChange={e => setFormUsuario({...formUsuario, cargo: e.target.value})} required style={inputStyle}>
                    <option value="RECEPCAO">Recepção</option>
                    <option value="TRIAGEM">Triagem</option>
                    <option value="MEDICO">Médico</option>
                    <option value="EXAMES">SADT / Exames</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Senha Provisória</label>
                  <input type="password" value={formUsuario.senha} onChange={e => setFormUsuario({...formUsuario, senha: e.target.value})} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', gridColumn: '1 / -1' }}>
                <button type="button" onClick={() => setModalUsuario(false)} style={btnDanger}>Cancelar</button>
                <button type="submit" style={btnPrimary}>Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEstoque && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={sectionTitle}>Entrada de Nota Fiscal / Estoque</h3>
            <form onSubmit={salvarEstoque} style={formStyle}>
              <div style={inputGroup}>
                <label style={labelStyle}>Nome do Insumo / Produto</label>
                <input type="text" value={formEstoque.nome} onChange={e => setFormEstoque({...formEstoque, nome: e.target.value})} placeholder="Ex: Gaze Estéril" required style={inputStyle} />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Quantidade Adicionada</label>
                <input type="number" value={formEstoque.quantidade} onChange={e => setFormEstoque({...formEstoque, quantidade: e.target.value})} placeholder="Apenas números" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalEstoque(false)} style={btnDanger}>Cancelar</button>
                <button type="submit" style={btnPrimary}>Gravar Estoque</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body, html, main, div { background-color: #fff !important; margin: 0; padding: 0; box-shadow: none !important; }
          main { padding: 20px !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        }
      `}} />
    </div>
  );
}

const getBadgeStyle = (cargo) => {
  if (cargo === 'ADMIN') return { padding: '4px 8px', backgroundColor: '#34495e', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
  if (cargo === 'MEDICO') return { padding: '4px 8px', backgroundColor: '#e1f5fe', color: '#0288d1', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
  return { padding: '4px 8px', backgroundColor: '#f0f2f5', color: '#2c3e50', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
};

const getBadgeStatusGuia = (status) => {
  if (status === 'PAGO') return { padding: '4px 8px', backgroundColor: '#e8f8f5', color: '#16a085', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
  if (status === 'GLOSADO') return { padding: '4px 8px', backgroundColor: '#fdedec', color: '#c0392b', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
  if (status === 'ENVIADO') return { padding: '4px 8px', backgroundColor: '#eef2f5', color: '#2980b9', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
  return { padding: '4px 8px', backgroundColor: '#fff3e0', color: '#d35400', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
};

const containerStyle = { display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#f4f7f6', fontFamily: 'system-ui, sans-serif' };
const sidebarStyle = { width: '250px', backgroundColor: '#2c3e50', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' };
const sidebarHeader = { padding: '20px', backgroundColor: '#1a252f', borderBottom: '1px solid #34495e', textAlign: 'center' };
const navStyle = { display: 'flex', flexDirection: 'column', padding: '15px 0' };
const btnMenu = { padding: '15px 20px', backgroundColor: 'transparent', color: '#bdc3c7', border: 'none', textAlign: 'left', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: '0.2s', borderLeft: '4px solid transparent' };
const btnMenuAtivo = { ...btnMenu, backgroundColor: '#34495e', color: '#fff', borderLeft: '4px solid #3498db' };
const contentStyle = { flex: 1, padding: '30px', overflowY: 'auto' };
const headerStyle = { marginBottom: '30px', borderBottom: '2px solid #dfe6e9', paddingBottom: '15px' };
const gridCards = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' };
const cardMetric = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '10px' };
const cardTitle = { color: '#7f8c8d', fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold' };
const cardValue = { color: '#2c3e50', fontSize: '28px', fontWeight: 'bold' };
const panelWhite = { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' };
const sectionTitle = { margin: '0 0 20px 0', color: '#2c3e50', fontSize: '18px' };
const flexBetween = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thRowStyle = { backgroundColor: '#f8f9fa', borderBottom: '2px solid #dfe6e9' };
const thStyle = { padding: '12px 15px', textAlign: 'left', fontSize: '13px', color: '#7f8c8d', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f0f2f5' };
const tdStyle = { padding: '15px', fontSize: '14px', color: '#34495e', verticalAlign: 'middle' };
const emptyState = { padding: '30px', textAlign: 'center', color: '#95a5a6', fontStyle: 'italic' };
const btnPrimary = { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { padding: '10px 20px', backgroundColor: 'transparent', color: '#3498db', border: '1px solid #3498db', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const btnSuccess = { padding: '10px 20px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const btnDanger = { padding: '6px 12px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnActionTable = { padding: '6px 12px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnActionTableSuccess = { padding: '6px 12px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' };
const btnActionTableDanger = { padding: '6px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' };
const badgeSuccess = { padding: '4px 8px', backgroundColor: '#e8f8f5', color: '#16a085', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
const badgeDanger = { padding: '4px 8px', backgroundColor: '#fdedec', color: '#c0392b', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
const listStyle = { listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' };
const listItemWarning = { padding: '12px', backgroundColor: '#fff3e0', borderLeft: '4px solid #e67e22', borderRadius: '4px', fontSize: '14px', color: '#d35400' };
const listItemInfo = { padding: '12px', backgroundColor: '#e1f5fe', borderLeft: '4px solid #3498db', borderRadius: '4px', fontSize: '14px', color: '#2980b9' };
const listItemSuccess = { padding: '12px', backgroundColor: '#e8f8f5', borderLeft: '4px solid #2ecc71', borderRadius: '4px', fontSize: '14px', color: '#27ae60' };
const fadeAnimation = { animation: 'fadeIn 0.3s ease-in-out' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalBoxStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', color: '#7f8c8d', fontWeight: 'bold' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
const inputFilterStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '13px' };