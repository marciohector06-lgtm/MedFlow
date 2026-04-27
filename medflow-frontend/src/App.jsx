import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Recepcao from './pages/Recepcao';
import PainelMedico from './pages/PainelMedico';
import Triagem from './pages/Triagem';
import Exames from './pages/Exames';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/recepcao" element={<Recepcao />} />
        
        {/* 🔥 O ERRO ESTAVA AQUI! Agora a rota chama '/medico' do jeito que o Login espera */}
        <Route path="/medico" element={<PainelMedico />} />
        
        <Route path="/Triagem" element={<Triagem />} />
        <Route path="/Exames" element={<Exames />} />

        {/* Rota de segurança: se o cara digitar um link que não existe, volta pro Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;