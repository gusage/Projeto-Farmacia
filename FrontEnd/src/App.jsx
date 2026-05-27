// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login'; 
import PainelAlertas from './pages/PainelAlertas';
import ColetaForm from './pages/ColetaForm';
import AnaliseLaudos from './pages/AnaliseLaudos';
import ConsultaAnalise from './pages/ConsultaAnalise';
import AnaliseTendencia from './pages/AnaliseTendencia';
import GerenciarColaboradores from './pages/GerenciarColaboradores';

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  
  // Se o usuário não fez login, a única rota existente e acessível no sistema inteiro é o /login
  if (!usuarioLogado) {
    return <Login setUsuarioLogado={setUsuarioLogado} />;
  }

  return (
    <BrowserRouter>
      {/* BACKGROUND INDUSTRIAL ESCURO COMPLETO */}
      <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono flex flex-col antialiased">
        
        {/* NAVBAR CORRIGIDA NO TOPO */}
        <Navbar usuario={usuarioLogado} setUsuarioLogado={setUsuarioLogado} />
        
        {/* CONTAINER DE CONTEÚDO RESTRITO COM PADDING PARA NÃO COLAR NAS BORDAS */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <Routes>
            <Route path="/" element={<Navigate to="/alertas" />} />
            <Route path="/alertas" element={<PainelAlertas />} />
            <Route path="/coleta" element={<ColetaForm />} />
            <Route path="/analise" element={<AnaliseLaudos />} />
            <Route path="/consulta" element={<ConsultaAnalise />} />
            <Route path="/tendencia" element={<AnaliseTendencia />} />
            <Route path="/colaboradores" element={<GerenciarColaboradores />} />
          </Routes>
        </main>

        {/* RODAPÉ DO SISTEMA */}
        <footer className="border-t border-slate-900 bg-[#161b22]/40 px-6 py-3 text-center text-[10px] text-slate-600 uppercase tracking-widest">
          BIOCOUNT MES v2.4.0 · CONTROLE DE PROCESSO VALIDADO
        </footer>
      </div>
    </BrowserRouter>
  );
}