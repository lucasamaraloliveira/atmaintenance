'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, FileUp, FileDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadMarkdownFile, htmlToMarkdown, markdownToHtml } from '@/lib/markdown';

interface FloatingActionsProps {
  currentInstruction?: {
    siteName: string;
    content: string;
  } | null;
  onImport?: (data: { siteName: string; content: string }) => void;
  getEditorContent?: () => { siteName: string; content: string } | null;
}

export default function FloatingActions({
  currentInstruction,
  onImport,
  getEditorContent,
}: FloatingActionsProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showFeedback = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isDark = resolvedTheme === 'dark';

  const handleExport = () => {
    let siteName = currentInstruction?.siteName || 'instrucao';
    let content = currentInstruction?.content || '';

    // Se houver função para obter o conteúdo mais recente do editor em tela
    if (getEditorContent) {
      const live = getEditorContent();
      if (live) {
        siteName = live.siteName || siteName;
        content = live.content || content;
      }
    }

    if (!content.trim()) {
      showFeedback('Nenhum conteúdo para exportar.');
      return;
    }

    const markdown = htmlToMarkdown(content);
    downloadMarkdownFile(siteName, markdown);
    showFeedback(`Exportado como "${siteName}.md"!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (!rawText) return;

      const html = markdownToHtml(rawText);

      // Detecta nome do site pelo primeiro # H1 ou pelo nome do arquivo
      let name = file.name.replace(/\.(md|markdown|txt)$/i, '');
      const headingMatch = rawText.match(/^#\s+(.+)$/m);
      if (headingMatch && headingMatch[1]) {
        name = headingMatch[1].trim();
      }

      if (onImport) {
        onImport({
          siteName: name,
          content: html,
        });
        showFeedback(`"${name}" importado com sucesso!`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".md,.markdown,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Floating Pill Container */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end gap-2">
        {/* Feedback Bubble */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#1D1D1F] dark:bg-[#2C2C2E] text-white shadow-lg border border-white/10"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Capsule Bar */}
        <div className="flex items-center gap-1 p-1.5 rounded-full apple-glass border border-[#D2D2D7]/80 dark:border-[#38383A]/80 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/10">
          {/* Botão de Alternância de Tema */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className="p-2.5 rounded-full text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-all active:scale-95 group relative"
          >
            {mounted && isDark ? (
              <Sun size={18} className="text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon size={18} className="text-[#009BDB] transition-transform duration-300 group-hover:-rotate-12" />
            )}
            <span className="sr-only">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <div className="w-px h-5 bg-[#D2D2D7] dark:bg-[#38383A] my-auto" />

          {/* Botão Importar MD */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Importar arquivo Markdown (.md)"
            aria-label="Importar arquivo Markdown (.md)"
            className="p-2.5 rounded-full text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-all active:scale-95 group relative"
          >
            <FileUp size={18} className="text-[#424245] dark:text-[#C7C7CC] group-hover:text-[#009BDB] transition-colors" />
            <span className="sr-only">Importar MD</span>
          </button>

          {/* Botão Exportar MD */}
          <button
            onClick={handleExport}
            title={currentInstruction ? `Exportar "${currentInstruction.siteName || 'instrução'}" em Markdown (.md)` : 'Exportar Markdown (.md)'}
            aria-label="Exportar Markdown (.md)"
            disabled={!currentInstruction}
            className={`p-2.5 rounded-full transition-all group relative ${
              currentInstruction 
                ? 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] active:scale-95' 
                : 'text-[#86868B]/40 dark:text-[#8E8E93]/30 cursor-not-allowed'
            }`}
          >
            <FileDown size={18} className={currentInstruction ? 'text-[#424245] dark:text-[#C7C7CC] group-hover:text-[#009BDB] transition-colors' : ''} />
            <span className="sr-only">Exportar MD</span>
          </button>
        </div>
      </div>
    </>
  );
}
