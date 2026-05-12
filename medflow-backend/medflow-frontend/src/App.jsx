import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;