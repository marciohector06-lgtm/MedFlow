import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Evita que a página recarregue do zero

    // Por enquanto, vamos simular o login para você conseguir testar o visual!
    // Na Meta 1 do Backend, vamos fazer isso consultar o PostgreSQL de verdade.
    
    // Salva um "crachá" fake no navegador só para a Recepção saber quem logou
    localStorage.setItem('@MedFlow:usuario', JSON.stringify({ nome: 'Márcio', cargo: 'ADMIN' }));

    // O comando mágico que te joga lá pra tela do Kanban!
    navigate('/recepcao');
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

          <button type="submit" className="btn-login">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}