import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Recepcao from './pages/Recepcao';
import PainelMedico from './pages/PainelMedico';
import Triagem from './pages/Triagem';
import Exames from './pages/Exames';
import PainelAdmin from './pages/PainelAdmin';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminFinanceiro from './pages/AdminFinanceiro';
import AdminServicos from './pages/AdminServicos';
import './App.css';

function NavBarOperacional() {
  const location = useLocation();
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>🏥 MedFlow - Operação</div>
      <div style={navLinks}>
        <Link to="/recepcao" style={location.pathname === '/recepcao' ? linkActive : linkStyle}>Recepção</Link>
        <Link to="/Triagem" style={location.pathname === '/Triagem' ? linkActive : linkStyle}>Triagem</Link>
        <Link to="/medico" style={location.pathname === '/medico' ? linkActive : linkStyle}>Consultório</Link>
        <Link to="/Exames" style={location.pathname === '/Exames' ? linkActive : linkStyle}>Exames</Link>
        <button onClick={() => window.location.href = '/'} style={btnSair}>Sair</button>
      </div>
    </nav>
  );
}

function LayoutManager({ children }) {
  const location = useLocation();
  const path = location.pathname;

  const isLogin = path === '/';
  const isAdminArea = path.startsWith('/admin');

  if (isLogin) {
    return <>{children}</>;
  }

  if (isAdminArea) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>{children}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <NavBarOperacional />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutManager>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/recepcao" element={<Recepcao />} />
          <Route path="/medico" element={<PainelMedico />} />
          <Route path="/Triagem" element={<Triagem />} />
          <Route path="/Exames" element={<Exames />} />
          <Route path="/admin" element={<PainelAdmin />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
          <Route path="/admin/servicos" element={<AdminServicos />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutManager>
    </BrowserRouter>
  );
}

const navStyle = { backgroundColor: '#2c3e50', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const logoStyle = { fontSize: '24px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' };
const navLinks = { display: 'flex', gap: '15px', alignItems: 'center' };
const linkStyle = { color: '#bdc3c7', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', transition: '0.3s' };
const linkActive = { ...linkStyle, backgroundColor: '#34495e', color: '#fff' };
const btnSair = { padding: '8px 16px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '20px' };