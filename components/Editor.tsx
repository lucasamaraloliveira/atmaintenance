'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import { Save, Eye, Edit3, Globe } from 'lucide-react';

interface Instruction {
  id: string;
  siteName: string;
  content: string;
}

export default function Editor({
  instruction,
  onSave,
  isSidebarCollapsed,
}: {
  instruction: Instruction | null;
  onSave: (data: { siteName: string; content: string }) => void;
  isSidebarCollapsed?: boolean;
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>(instruction ? 'preview' : 'edit');
  const [siteName, setSiteName] = useState(instruction?.siteName || '');
  const [content, setContent] = useState(instruction?.content || '');

  if (!instruction && siteName === '' && content === '') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#86868B] bg-white">
        <Globe size={64} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Selecione um site para ver as instruções</p>
        <p className="text-sm">Ou crie uma nova instrução no menu lateral.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className={`p-4 border-b border-[#D2D2D7] flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all ${
        isSidebarCollapsed ? 'pl-16' : 'pl-4'
      }`}>
        <div className="flex-1 mr-4">
          <input
            type="text"
            placeholder="Nome do Site"
            className="text-xl font-bold w-full outline-none border-none focus:ring-0 placeholder:text-[#D2D2D7]"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-[#E8E8ED] p-1 rounded-lg mr-2">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                mode === 'edit' ? 'bg-white shadow-sm' : 'text-[#86868B]'
              }`}
            >
              <Edit3 size={14} /> Editar
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                mode === 'preview' ? 'bg-white shadow-sm' : 'text-[#86868B]'
              }`}
            >
              <Eye size={14} /> Visualizar
            </button>
          </div>
          
          <button
            onClick={() => onSave({ siteName, content })}
            className="apple-button flex items-center gap-2"
          >
            <Save size={18} /> Salvar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        {mode === 'edit' ? (
          <textarea
            className="w-full h-full min-h-[500px] outline-none border-none resize-none font-mono text-sm leading-relaxed placeholder:text-[#D2D2D7]"
            placeholder="Escreva suas instruções em Markdown aqui..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <div className="markdown-body">
            {content ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkEmoji]}
                rehypePlugins={[rehypeRaw]}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-[#86868B] italic">Nenhum conteúdo definido.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
