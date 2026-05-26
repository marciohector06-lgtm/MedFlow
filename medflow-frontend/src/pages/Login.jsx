import { useState } from 'react';
import { api } from '../services/api';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('RECEPCAO');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, senha, cargo: perfil });
      
      const userData = {
        ...res.data.user,
        cargo: perfil
      };

      localStorage.setItem('@MedFlow:user', JSON.stringify(userData));
      localStorage.setItem('@MedFlow:token', res.data.token);

      window.location.href = '/dashboard_redirect';
    } catch (err) {
      alert('Credenciais invalidas ou erro na conexao com o servidor.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={loginBoxStyle}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <Logo width="220" />
        </div>
        
        <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px' }}>
          Acesse o sistema da clínica
        </p>

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@medflow.com"
              required 
              style={inputStyle} 
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              placeholder="********"
              required 
              style={inputStyle} 
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Perfil de Acesso</label>
            <select 
              value={perfil} 
              onChange={e => setPerfil(e.target.value)} 
              style={inputStyle}
            >
              <option value="ADMIN">Administrador</option>
              <option value="RECEPCAO">Recepção</option>
              <option value="TRIAGEM">Triagem</option>
              <option value="MEDICO">Médico</option>
              <option value="EXAMES">Exames</option>
            </select>
          </div>

          <button type="submit" style={btnStyle}>Entrar no Sistema</button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', fontFamily: 'system-ui, sans-serif' };
const loginBoxStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #dcdde1', fontSize: '15px', backgroundColor: '#f8f9fa' };
const btnStyle = { padding: '14px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: '0.2s' };