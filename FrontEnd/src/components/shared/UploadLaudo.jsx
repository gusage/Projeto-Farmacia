// src/components/shared/UploadLaudo.jsx
import { useState } from 'react';
import api from '../../services/api';

export default function UploadLaudo({ laudoId, arquivos = [], onAtualizar }) {
  const [enviando,   setEnviando]   = useState(false);
  const [removendo,  setRemovendo]  = useState('');
  const [mensagem,   setMensagem]   = useState({ tipo: '', texto: '' });

  const flash = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
  };

  const handleUpload = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    // Valida tamanho — max 10MB
    if (arquivo.size > 10 * 1024 * 1024) {
      flash('erro', '❌ Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setEnviando(true);
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    try {
      const response = await api.post(`/laudos/upload/${laudoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onAtualizar(response.data); // atualiza o laudo no componente pai
      flash('sucesso', '✅ Arquivo enviado com sucesso!');
    } catch {
      flash('erro', '❌ Erro ao enviar arquivo.');
    } finally {
      setEnviando(false);
      e.target.value = ''; // reseta o input
    }
  };

  const handleRemover = async (publicId) => {
    if (!window.confirm('Remover este arquivo?')) return;
    setRemovendo(publicId);

    try {
      await api.delete('/laudos/arquivo/:id', {
        data: { publicId, laudoId }
      });
      onAtualizar(prev => ({
        ...prev,
        arquivos: prev.arquivos.filter(a => a.publicId !== publicId)
      }));
      flash('sucesso', '✅ Arquivo removido.');
    } catch {
      flash('erro', '❌ Erro ao remover arquivo.');
    } finally {
      setRemovendo('');
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-800/50">

      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">
          Arquivos do Laudo
        </span>

        {/* Botão de upload */}
        <label className={`cursor-pointer bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border border-blue-900/50 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-wider transition-all ${enviando ? 'opacity-50 pointer-events-none' : ''}`}>
          {enviando ? 'Enviando...' : '📎 Anexar Laudo'}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleUpload}
            disabled={enviando}
          />
        </label>
      </div>

      {/* Flash */}
      {mensagem.texto && (
        <div className={`p-2 rounded text-[10px] font-bold border ${
          mensagem.tipo === 'sucesso'
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
            : 'bg-rose-950/40 text-rose-400 border-rose-800'
        }`}>
          {mensagem.texto}
        </div>
      )}

      {/* Lista de arquivos */}
      {arquivos.length === 0 ? (
        <p className="text-[10px] text-slate-600 italic">Nenhum arquivo anexado.</p>
      ) : (
        <div className="space-y-2">
          {arquivos.map((arq) => (
            <div key={arq.publicId} className="flex items-center justify-between bg-[#0d1117] border border-slate-800 rounded px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-500 text-xs">📄</span>
                <a
                  href={arq.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline truncate"
                >
                  {arq.nomeOriginal || 'Arquivo'}
                </a>
                <span className="text-[9px] text-slate-600 shrink-0">
                  {new Date(arq.dataUpload).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <button
                onClick={() => handleRemover(arq.publicId)}
                disabled={removendo === arq.publicId}
                className="text-slate-600 hover:text-rose-400 text-[10px] ml-2 shrink-0 transition-colors"
              >
                {removendo === arq.publicId ? '...' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
