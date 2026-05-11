import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ScannerEstoque from '../components/ScannerEstoque';

export default function PainelAdmin() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [atendimentos, setAtendimentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [campanhas, setCampanhas] = useState([]);

  const [formUsuario, setFormUsuario] = useState({ nome: '', email: '', senha: '', cargo: 'RECEPCIONISTA' });
  const [formServico, setFormServico] = useState({ nome: '', valor: '', categoria: 'CONSULTA' });
  const [formProd, setFormProd] = useState({ nome: '', quantidade: '', unidade: 'UN', precoCusto: '' });
  const [formCamp, setFormCamp] = useState({ nome: '', tema: 'Geral', mensagem: '', desconto: '' });

  const carregarDados = async () => {
    try {
      const resAtend = await api.get('/atendimentos');
      setAtendimentos(resAtend.data.dados || resAtend.data || []);
    } catch (e) { console.error(e); }

    try {
      const resUser = await api.get('/usuarios');
      setUsuarios(resUser.data || []);
    } catch (e) { console.error(e); }

    try {
      const resServ = await api.get('/servicos');
      setServicos(resServ.data || []);
    } catch (e) { console.error(e); }

    try {
      const resProd = await api.get('/produtos');
      setProdutos(resProd.data || []);
    } catch (e) { console.error(e); }

    try {
      const resCamp = await api.get('/campanhas');
      setCampanhas(resCamp.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCadastrarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', formUsuario);
      setFormUsuario({ nome: '', email: '', senha: '', cargo: 'RECEPCIONISTA' });
      carregarDados();
    } catch (e) { alert('Erro no cadastro'); }
  };

  const handleCadastrarServico = async (e) => {
    e.preventDefault();
    try {
      await api.post('/servicos', formServico);
      setFormServico({ nome: '', valor: '', categoria: 'CONSULTA' });
      carregarDados();
    } catch (e) { alert('Erro no serviço'); }
  };

  const handleCadastrarProduto = async (e) => {
    e.preventDefault();
    try {
      await api.post('/produtos', formProd);
      setFormProd({ nome: '', quantidade: '', unidade: 'UN', precoCusto: '' });
      carregarDados();
    } catch (e) { alert('Erro no estoque'); }
  };

  const handleDispararCampanha = async (e) => {
    e.preventDefault();
    if(!confirm('Confirmar disparo em massa?')) return;
    try {
      await api.post('/campanhas/disparar', formCamp);
      setFormCamp({ nome: '', tema: 'Geral', mensagem: '', desconto: '' });
      alert('Campanha enviada!');
      carregarDados();
    } catch (e) { alert('Erro no disparo'); }
  };

  const calcularSLA = (a) => {
    const inicio = new Date(a.createdAt);
    const chamado = new Date(a.updatedAt);
    return Math.floor((chamado - inicio) / 60000);
  };

  const finalizados = atendimentos.filter(a => a.status === 'FINALIZADO');
  const faturamentoTotal = finalizados.reduce((acc, a) => acc + (a.servico?.valor || 250), 0);
  const aguardando = atendimentos.filter(a => a.status === 'AGUARDANDO').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <aside style={{ width: '260px', backgroundColor: '#1c242d', color: 'white', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>MedFlow Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setAbaAtiva('dashboard')} style={abaAtiva === 'dashboard' ? btnNavActive : btnNav}>📊 Dashboard</button>
          <button onClick={() => setAbaAtiva('usuarios')} style={abaAtiva === 'usuarios' ? btnNavActive : btnNav}>👥 Equipe</button>
          <button onClick={() => setAbaAtiva('estoque')} style={abaAtiva === 'estoque' ? btnNavActive : btnNav}>📦 Estoque</button>
          <button onClick={() => setAbaAtiva('campanhas')} style={abaAtiva === 'campanhas' ? btnNavActive : btnNav}>📣 Campanhas</button>
          <button onClick={() => setAbaAtiva('financeiro')} style={abaAtiva === 'financeiro' ? btnNavActive : btnNav}>💸 Financeiro</button>
          <button onClick={() => setAbaAtiva('servicos')} style={abaAtiva === 'servicos' ? btnNavActive : btnNav}>💰 Preços</button>
          <button onClick={() => navigate('/')} style={{ ...btnNav, marginTop: '40px', color: '#ff7675' }}>Sair</button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '0px' }}>
        <header style={{ backgroundColor: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 'bold' }}>PAINEL DO ADMINISTRADOR</h1>
          <span style={{ fontSize: '14px', color: '#666' }}>Gestão: <strong>Administrativa</strong></span>
        </header>

        <div style={{ padding: '30px 40px' }}>
          {abaAtiva === 'dashboard' && (
            <section>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ ...cardBase, backgroundColor: '#4089bd' }}><span>TOTAL DE PACIENTES</span><p>{atendimentos.length}</p></div>
                <div style={{ ...cardBase, backgroundColor: '#27ae60' }}><span>FATURAMENTO ESTIMADO</span><p>R$ {faturamentoTotal.toFixed(2)}</p></div>
                <div style={{ ...cardBase, backgroundColor: '#e74c3c' }}><span>GARGALO NA RECEPÇÃO</span><p>{aguardando} Aguardando</p></div>
              </div>
              <div style={panelWhite}>
                <h3>Últimos Registros</h3>
                <table className="medflow-table" style={{ width: '100%', marginTop: '15px' }}>
                  <thead><tr style={{ textAlign: 'left' }}><th>Ficha</th><th>Paciente</th><th>Convênio</th><th>Status</th></tr></thead>
                  <tbody>
                    {atendimentos.slice(0, 5).map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tdStyle}>#{a.id.substring(0,5).toUpperCase()}</td>
                        <td style={tdStyle}>{a.paciente?.nome || 'Paciente'}</td>
                        <td style={tdStyle}>{a.convenio}</td>
                        <td style={tdStyle}><span style={{ ...badge, backgroundColor: a.status === 'FINALIZADO' ? '#2ecc71' : '#f39c12' }}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {abaAtiva === 'usuarios' && (
            <section style={panelWhite}>
              <h2>👥 Profissionais</h2>
              <form onSubmit={handleCadastrarUsuario} style={formGrid}>
                <input type="text" placeholder="Nome" value={formUsuario.nome} onChange={e => setFormUsuario({...formUsuario, nome: e.target.value})} required style={inputStyle} />
                <input type="email" placeholder="E-mail" value={formUsuario.email} onChange={e => setFormUsuario({...formUsuario, email: e.target.value})} required style={inputStyle} />
                <input type="password" placeholder="Senha" value={formUsuario.senha} onChange={e => setFormUsuario({...formUsuario, senha: e.target.value})} required style={inputStyle} />
                <select value={formUsuario.cargo} onChange={e => setFormUsuario({...formUsuario, cargo: e.target.value})} style={inputStyle}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                  <option value="MEDICO">MÉDICO</option>
                </select>
                <button type="submit" style={btnAction}>Adicionar</button>
              </form>
              <table style={{ width: '100%', marginTop: '20px' }}>
                <thead><tr style={{ textAlign: 'left' }}><th>Nome</th><th>E-mail</th><th>Cargo</th></tr></thead>
                <tbody>{usuarios.map(u => (<tr key={u.id} style={{ borderBottom: '1px solid #eee' }}><td style={tdStyle}>{u.nome}</td><td style={tdStyle}>{u.email}</td><td style={tdStyle}>{u.cargo}</td></tr>))}</tbody>
              </table>
            </section>
          )}

          {abaAtiva === 'estoque' && (
            <section style={panelWhite}>
              <h2>📦 Estoque Inteligente</h2>
              <ScannerEstoque onUpdate={carregarDados} />
              <form onSubmit={handleCadastrarProduto} style={{ ...formGrid, marginTop: '30px' }}>
                <input type="text" placeholder="Item" value={formProd.nome} onChange={e => setFormProd({...formProd, nome: e.target.value})} required style={inputStyle} />
                <input type="number" placeholder="Qtd" value={formProd.quantidade} onChange={e => setFormProd({...formProd, quantidade: e.target.value})} required style={inputStyle} />
                <input type="text" placeholder="Custo" value={formProd.precoCusto} onChange={e => setFormProd({...formProd, precoCusto: e.target.value})} required style={inputStyle} />
                <button type="submit" style={btnAction}>Salvar</button>
              </form>
              <table style={{ width: '100%', marginTop: '20px' }}>
                <thead><tr style={{ textAlign: 'left' }}><th>ID / QR</th><th>Item</th><th>Qtd</th></tr></thead>
                <tbody>{produtos.map(p => (<tr key={p.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ ...tdStyle, fontSize: '10px' }}>{p.id}</td><td style={tdStyle}>{p.nome}</td><td style={tdStyle}>{p.quantidade}</td></tr>))}</tbody>
              </table>
            </section>
          )}

          {abaAtiva === 'campanhas' && (
            <section style={panelWhite}>
              <h2>📣 Campanhas WhatsApp</h2>
              <form onSubmit={handleDispararCampanha} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Título" value={formCamp.nome} onChange={e => setFormCamp({...formCamp, nome: e.target.value})} required style={inputStyle} />
                <textarea placeholder="Mensagem..." value={formCamp.mensagem} onChange={e => setFormCamp({...formCamp, mensagem: e.target.value})} required style={{ ...inputStyle, height: '80px' }} />
                <button type="submit" style={{ ...btnAction, backgroundColor: '#25d366' }}>🚀 Disparar</button>
              </form>
            </section>
          )}

          {abaAtiva === 'financeiro' && (
            <section>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ ...cardBase, backgroundColor: '#8e44ad' }}><span>REPASSE (60%)</span><p>R$ {(faturamentoTotal * 0.6).toFixed(2)}</p></div>
                <div style={{ ...cardBase, backgroundColor: '#27ae60' }}><span>LUCRO (40%)</span><p>R$ {(faturamentoTotal * 0.4).toFixed(2)}</p></div>
              </div>
            </section>
          )}

          {abaAtiva === 'servicos' && (
            <section style={panelWhite}>
              <h2>💰 Tabela de Preços</h2>
              <form onSubmit={handleCadastrarServico} style={formGrid}>
                <input type="text" placeholder="Serviço" value={formServico.nome} onChange={e => setFormServico({...formServico, nome: e.target.value})} required style={inputStyle} />
                <input type="number" placeholder="Preço" value={formServico.valor} onChange={e => setFormServico({...formServico, valor: e.target.value})} required style={inputStyle} />
                <button type="submit" style={btnAction}>Gravar</button>
              </form>
              <table style={{ width: '100%', marginTop: '20px' }}>
                <thead><tr style={{ textAlign: 'left' }}><th>Serviço</th><th>Valor</th></tr></thead>
                <tbody>{servicos.map(s => (<tr key={s.id} style={{ borderBottom: '1px solid #eee' }}><td style={tdStyle}>{s.nome}</td><td style={tdStyle}>R$ {s.valor.toFixed(2)}</td></tr>))}</tbody>
              </table>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

const btnNav = { padding: '12px 15px', border: 'none', borderRadius: '4px', backgroundColor: 'transparent', color: '#aabccf', textAlign: 'left', cursor: 'pointer', fontSize: '15px' };
const btnNavActive = { ...btnNav, backgroundColor: '#34495e', color: 'white', fontWeight: 'bold' };
const cardBase = { padding: '20px', borderRadius: '4px', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const panelWhite = { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ddd' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', marginTop: '15px' };
const btnAction = { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const badge = { padding: '3px 10px', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: 'bold' };
const tdStyle = { padding: '12px 0', fontSize: '14px', color: '#333' };