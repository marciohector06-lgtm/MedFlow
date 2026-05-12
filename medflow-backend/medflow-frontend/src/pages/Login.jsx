import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('recepcao');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (perfil === 'medico') {
      localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'Dr. Márcio Henrique', cargo: 'medico' }));
      navigate('/medico');
    } else if (perfil === 'admin') {
      localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'Gestão', cargo: 'admin' }));
      navigate('/admin');
    } else if (perfil === 'triagem') {
      localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'Triagem', cargo: 'triagem' }));
      navigate('/Triagem');
    } else if (perfil === 'exames') {
      localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'SADT', cargo: 'exames' }));
      navigate('/Exames');
    } else {
      localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'Recepção', cargo: 'recepcao' }));
      navigate('/recepcao');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>MedFlow</h2>
        <p>Acesse o sistema da clínica</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <div className="input-group">
            <label>Perfil de Acesso</label>
            <select 
              value={perfil} 
              onChange={(e) => setPerfil(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="recepcao">Recepção</option>
              <option value="triagem">Triagem</option>
              <option value="medico">Médico</option>
              <option value="exames">Exames (SADT)</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button type="submit" className="btn-login" style={{ marginTop: '15px' }}>
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}