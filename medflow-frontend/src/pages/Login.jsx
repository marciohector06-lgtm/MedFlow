import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('recepcao');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); 

    // Verifica o perfil escolhido e manda para a tela certa
    if (perfil === 'medico') {
      // AJUSTE: cargo salvo como 'medico' (minúsculo e sem acento) para não dar erro na trava de segurança da tela
      localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'Dr. Silva', cargo: 'medico' }));
      navigate('/medico');
    } else {
      // AJUSTE: cargo salvo como 'recepcao' para manter o mesmo padrão seguro
      localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'Márcio', cargo: 'recepcao' }));
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
              <option value="medico">Médico</option>
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