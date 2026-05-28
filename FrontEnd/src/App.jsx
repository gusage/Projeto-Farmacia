// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import PainelAlertas from './pages/PainelAlertas';
import ColetaForm from './pages/ColetaForm';
import AnaliseLaudos from './pages/AnaliseLaudos';
import ConsultaAnalise from './pages/ConsultaAnalise';
import AnaliseTendencia from './pages/AnaliseTendencia';
import GerenciarColaboradores from './pages/GerenciarColaboradores';
import CadastroUsuario from './pages/CadastroUsuario';

// Protege rotas — redireciona pro login se não autenticado
function RotaProtegida({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas dentro do layout */}
        <Route
          element={
            <RotaProtegida>
              <MainLayout />
            </RotaProtegida>
          }
        >
          <Route path="/" element={<Navigate to="/alertas" replace />} />
          <Route path="/alertas" element={<PainelAlertas />} />
          <Route path="/coleta" element={<ColetaForm />} />
          <Route path="/analise" element={<AnaliseLaudos />} />
          <Route path="/consulta" element={<ConsultaAnalise />} />
          <Route path="/tendencia" element={<AnaliseTendencia />} />
          <Route path="/colaboradores" element={<GerenciarColaboradores />} />
          <Route path="/cadastro" element={<CadastroUsuario />} />
        </Route>

        {/* Qualquer rota desconhecida volta pro início */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
