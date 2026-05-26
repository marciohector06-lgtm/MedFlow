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
import Logo from './components/Logo';
import './App.css';

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('@MedFlow:user'));
  
  if (!user) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(user.cargo)) {
    return <Navigate to="/dashboard_redirect" />;
  }

  return children;
}

function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('@MedFlow:user'));
  if (!user) return <Navigate to="/" />;

  switch (user.cargo) {
    case 'ADMIN': return <Navigate to="/admin" />;
    case 'RECEPCAO': return <Navigate to="/recepcao" />;
    case 'MEDICO': return <Navigate to="/medico" />;
    case 'TRIAGEM': return <Navigate to="/Triagem" />;
    case 'EXAMES': return <Navigate to="/Exames" />;
    default: return <Navigate to="/" />;
  }
}

function NavBarOperacional() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('@MedFlow:user'));
  
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        <Logo width="180" />
      </div>
      <div style={navLinks}>
        {(user?.cargo === 'ADMIN' || user?.cargo === 'RECEPCAO') && (
          <Link to="/recepcao" style={location.pathname === '/recepcao' ? linkActive : linkStyle}>Recepção</Link>
        )}
        
        {(user?.cargo === 'ADMIN' || user?.cargo === 'TRIAGEM') && (
          <Link to="/Triagem" style={location.pathname === '/Triagem' ? linkActive : linkStyle}>Triagem</Link>
        )}

        {(user?.cargo === 'ADMIN' || user?.cargo === 'MEDICO') && (
          <Link to="/medico" style={location.pathname === '/medico' ? linkActive : linkStyle}>Consultório</Link>
        )}

        {(user?.cargo === 'ADMIN' || user?.cargo === 'EXAMES') && (
          <Link to="/Exames" style={location.pathname === '/Exames' ? linkActive : linkStyle}>Exames</Link>
        )}

        {user?.cargo === 'ADMIN' && (
          <Link to="/admin" style={location.pathname.startsWith('/admin') ? linkActive : linkStyle}>Admin</Link>
        )}
        
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={btnSair}>Sair</button>
      </div>
    </nav>
  );
}

function LayoutManager({ children }) {
  const location = useLocation();
  const isLogin = location.pathname === '/';

  if (isLogin) return <>{children}</>;

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
          <Route path="/dashboard_redirect" element={<DashboardRedirect />} />
          
          <Route path="/recepcao" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCAO']}>
              <Recepcao />
            </ProtectedRoute>
          } />

          <Route path="/medico" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MEDICO']}>
              <PainelMedico />
            </ProtectedRoute>
          } />

          <Route path="/Triagem" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TRIAGEM']}>
              <Triagem />
            </ProtectedRoute>
          } />

          <Route path="/Exames" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'EXAMES']}>
              <Exames />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PainelAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/usuarios" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsuarios /></ProtectedRoute>
          } />

          <Route path="/admin/financeiro" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminFinanceiro /></ProtectedRoute>
          } />

          <Route path="/admin/servicos" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminServicos /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutManager>
    </BrowserRouter>
  );
}

const navStyle = { backgroundColor: '#2c3e50', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const logoStyle = { display: 'flex', alignItems: 'center' };
const navLinks = { display: 'flex', gap: '15px', alignItems: 'center' };
const linkStyle = { color: '#bdc3c7', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', transition: '0.3s', fontSize: '14px' };
const linkActive = { ...linkStyle, backgroundColor: '#34495e', color: '#fff' };
const btnSair = { padding: '8px 16px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '20px' };