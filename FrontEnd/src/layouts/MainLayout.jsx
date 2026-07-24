import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-mono flex flex-col antialiased">
      <Navbar />
      <main className="flex-1 max-w-400 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet /> {/* aqui renderiza a página da rota ativa */}
      </main>
      <footer className="border-t border-slate-900 bg-[#161b22]/40 px-6 py-3 text-center text-[10px] text-slate-600 uppercase tracking-widest">
        BIOCOUNT MES v2.4.0 · CONTROLE DE PROCESSO VALIDADO
      </footer>
    </div>
  );
}