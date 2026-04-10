import {browserRouter, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Recepcao from './pages/Recepcao';
import PainelMedico from './pages/PainelMedico';
import Triagem from './pages/Triagem';
import Exames from './pages/Exames';
import './App.css';

function App()  {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route path="recepcao" element={<Recepcao/>}/>
      <Route path="PainelMedico" element={<PainelMedico/>}/>
      <Route path="Triagem" element={<Triagem/>}/>
      <Route path="Exames" element={<Exames/>}/>

      <Route path="*" element={<Navigate to="/" />} />
      
      </Routes>
      </BrowserRouter>
  );
}
export default App;