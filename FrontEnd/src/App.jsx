// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PainelAlertas from './pages/PainelAlertas';
import ColetaForm from './pages/ColetaForm';
import AnaliseLaudos from './pages/AnaliseLaudos';
import ConsultaAnalise from './pages/ConsultaAnalise';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono">
        <Navbar />
        <main className="p-2">
          <Routes>
            {/* Rota Raiz direciona automaticamente para o Painel de Alertas como primeiro */}
            <Route path="/" element={<Navigate to="/alertas" replace />} />
            
            {/* Definição das abas do sistema */}
            <Route path="/alertas" element={<PainelAlertas />} />
            <Route path="/coleta" element={<ColetaForm />} />
            <Route path="/analise" element={<AnaliseLaudos />} />
            <Route path="/consulta" element={<ConsultaAnalise />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}