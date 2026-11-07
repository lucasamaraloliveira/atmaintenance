'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { FontSize } from '@/lib/tiptap-extensions';
import { marked } from 'marked';
import { downloadMarkdownFile, htmlToMarkdown, markdownToHtml } from '@/lib/markdown';
import { MAINTENANCE_TEMPLATES, MaintenanceTemplate } from '@/lib/templates';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Eye, 
  Edit3, 
  Globe, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Type,
  Type as SizeIcon,
  Table as TableIcon,
  ChevronDown,
  List,
  ListOrdered,
  CheckSquare,
  Sparkles,
  Quote,
  Undo,
  Redo,
  Plus,
  Trash2,
  Printer,
  FileDown,
  FileUp,
  Check,
  Loader2
} from 'lucide-react';

interface Instruction {
  id: string;
  siteName: string;
  content: string;
}

const fontFamilies = [
  { label: 'Padrão', value: 'Inter, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'Monaco, monospace' },
  { label: 'Arial', value: 'Arial, sans-serif' },
];

const fontSizes = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '32px', value: '32px' },
];

export default function Editor({
  instruction,
  onSave,
  isSidebarCollapsed,
}: {
  instruction: Instruction | null;
  onSave: (data: { siteName: string; content: string }) => Promise<void> | void;
  isSidebarCollapsed?: boolean;
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>(instruction ? 'preview' : 'edit');
  const [siteName, setSiteName] = useState(instruction?.siteName || '');
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showTemplatesBar, setShowTemplatesBar] = useState(
    !instruction?.content || instruction.content.includes('Descreva aqui as instruções')
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: instruction?.content || '',
    editable: mode === 'edit',
  });

  useEffect(() => {
    if (editor && instruction) {
      let htmlContent = instruction.content;
      // Heurística: se não parecer HTML, trata como Markdown
      if (!htmlContent.trim().startsWith('<') && !htmlContent.includes('</')) {
        htmlContent = marked.parse(htmlContent) as string;
      }
      editor.commands.setContent(htmlContent);
      setSiteName(instruction.siteName);
      setSaveStatus('idle');
      setShowTemplatesBar(
        !htmlContent.trim() || htmlContent.includes('Descreva aqui as instruções')
      );
    }
  }, [instruction, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(mode === 'edit');
    }
  }, [mode, editor]);

  const handleSave = async () => {
    if (!editor || saveStatus === 'saving') return;
    setSaveStatus('saving');
    try {
      await onSave({
        siteName,
        content: editor.getHTML(),
      });
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2500);
    } catch {
      setSaveStatus('idle');
    }
  };

  const handleApplyTemplate = (template: MaintenanceTemplate) => {
    if (!editor) return;
    const currentText = editor.getText().trim();
    // Se já tiver conteúdo personalizado, pede confirmação
    if (currentText.length > 30 && !currentText.includes('Descreva aqui as instruções')) {
      const confirmChange = window.confirm(
        `Deseja aplicar o modelo "${template.name}"? O conteúdo atual do documento será substituído.`
      );
      if (!confirmChange) return;
    }

    editor.commands.setContent(template.htmlContent);
    if (!siteName.trim() || siteName === 'Novo Site' || siteName === 'Nova Instrução') {
      setSiteName(template.defaultSiteName);
    }
    setShowTemplatesBar(false);
  };

  // Atalhos de Teclado Globais (Ctrl+S, Ctrl+P, Ctrl+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;

      // Ctrl + S / Cmd + S: Salvar
      if (isModifier && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Ctrl + P / Cmd + P: Imprimir
      if (isModifier && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
        return;
      }

      // Ctrl + E / Cmd + E: Alternar Editar / Visualizar
      if (isModifier && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setMode((prev) => (prev === 'edit' ? 'preview' : 'edit'));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, siteName, saveStatus]);

  const handleExportMarkdown = () => {
    if (!editor) return;
    const md = htmlToMarkdown(editor.getHTML());
    downloadMarkdownFile(siteName || 'instrucao', md);
  };

  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (!rawText) return;

      const html = markdownToHtml(rawText);
      editor?.commands.setContent(html);

      const headingMatch = rawText.match(/^#\s+(.+)$/m);
      if (headingMatch && headingMatch[1]) {
        setSiteName(headingMatch[1].trim());
      } else {
        const nameFromFilename = file.name.replace(/\.(md|markdown|txt)$/i, '');
        setSiteName(nameFromFilename);
      }
      setMode('edit');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const insertTable = (cols: number, rows: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableMenu(false);
  };

  if (!instruction && siteName === '' && (!editor || editor.isEmpty)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#86868B] dark:text-[#8E8E93] bg-white dark:bg-[#141416] transition-colors h-full">
        <Globe size={64} className="mb-4 opacity-20" />
        <p className="text-lg font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Selecione um site para ver as instruções</p>
        <p className="text-sm">Ou crie ou importe uma instrução no menu.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#141416] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-300">
      {/* Input de arquivo para importação de Markdown */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".md,.markdown,.txt"
        onChange={handleImportMarkdown}
        className="hidden"
      />

      {/* Header */}
      <div className={`no-print p-4 border-b border-[#D2D2D7] dark:border-[#28282B] flex items-center justify-between bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md sticky top-0 z-10 transition-all ${
        isSidebarCollapsed ? 'pl-16' : 'pl-4'
      }`}>
        <div className="flex-1 mr-4 flex items-center">
          <input
            type="text"
            placeholder="Nome do Site"
            className="text-xl font-bold w-full outline-none border-none focus:ring-0 placeholder:text-[#D2D2D7] dark:placeholder:text-[#48484A] bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7]"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            disabled={mode === 'preview'}
          />

          {/* Animaçãozinha sutil de feedback visual ao lado do título */}
          <AnimatePresence>
            {saveStatus === 'saved' && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -5, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold ml-3 shadow-xs shrink-0 select-none"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Check size={13} className="stroke-[3]" />
                <span>Salvo com sucesso!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Alternador Edição / Visualização */}
          <div className="flex bg-[#E8E8ED] dark:bg-[#252528] p-1 rounded-lg mr-1 transition-colors">
            <button
              onClick={() => setMode('edit')}
              title="Modo de Edição (Ctrl+E)"
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                mode === 'edit' 
                  ? 'bg-white dark:bg-[#3A3A3D] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs' 
                  : 'text-[#86868B] dark:text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <Edit3 size={14} /> Editar
            </button>
            <button
              onClick={() => setMode('preview')}
              title="Modo de Visualização (Ctrl+E)"
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                mode === 'preview' 
                  ? 'bg-white dark:bg-[#3A3A3D] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs' 
                  : 'text-[#86868B] dark:text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <Eye size={14} /> Visualizar
            </button>
          </div>

          {/* Importar MD */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="apple-button-secondary flex items-center gap-1.5 text-xs py-2 px-3"
            title="Importar arquivo Markdown (.md)"
          >
            <FileUp size={15} /> Importar MD
          </button>

          {/* Exportar MD */}
          <button
            onClick={handleExportMarkdown}
            className="apple-button-secondary flex items-center gap-1.5 text-xs py-2 px-3"
            title="Exportar como arquivo Markdown (.md)"
          >
            <FileDown size={15} /> Exportar MD
          </button>
          
          {mode === 'preview' && (
            <button
              onClick={() => window.print()}
              title="Imprimir documento (Ctrl+P)"
              className="apple-button-secondary flex items-center gap-1.5 text-xs py-2 px-3"
            >
              <Printer size={15} /> Imprimir
            </button>
          )}
          
          {/* Botão de Salvar Animado */}
          <motion.button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            title="Salvar alterações (Ctrl+S)"
            animate={{
              scale: saveStatus === 'saved' ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ml-1 active:scale-95 shadow-sm min-w-[96px] ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                : saveStatus === 'saving'
                ? 'bg-[#009BDB]/80 text-white cursor-wait'
                : 'bg-[#009BDB] hover:bg-[#0087BF] text-white'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {saveStatus === 'saved' ? (
                <motion.span
                  key="saved"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="flex items-center gap-1.5 text-white"
                >
                  <Check size={16} className="stroke-[3]" />
                  Salvo!
                </motion.span>
              ) : saveStatus === 'saving' ? (
                <motion.span
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Save size={16} />
                  Salvar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Toolbar */}
      {mode === 'edit' && editor && (
        <div className={`no-print px-4 py-2 border-b border-[#D2D2D7] dark:border-[#28282B] bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-xl flex flex-wrap items-center gap-2 sticky top-[73px] z-10 transition-all ${
          isSidebarCollapsed ? 'pl-16' : 'pl-4'
        }`}>
          {/* Formatação de Texto */}
          <div className="flex items-center bg-[#E8E8ED]/50 dark:bg-[#222225] p-1 rounded-lg border border-transparent dark:border-[#2F2F33]">
            <ToolbarButton 
              active={editor.isActive('bold')} 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              icon={<Bold size={16} />} 
              title="Negrito"
            />
            <ToolbarButton 
              active={editor.isActive('italic')} 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              icon={<Italic size={16} />} 
              title="Itálico"
            />
            <ToolbarButton 
              active={editor.isActive('underline')} 
              onClick={() => editor.chain().focus().toggleUnderline().run()} 
              icon={<UnderlineIcon size={16} />} 
              title="Sublinhado"
            />
          </div>

          <div className="w-px h-6 bg-[#D2D2D7] dark:bg-[#333336] mx-1" />

          {/* Família da Fonte & Tamanho da Fonte */}
          <div className="flex items-center bg-[#E8E8ED]/50 dark:bg-[#222225] p-1 rounded-lg border border-transparent dark:border-[#2F2F33]">
            {/* Família da Fonte */}
            <div className="relative group">
              <button 
                type="button"
                className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium text-[#424245] dark:text-[#C7C7CC] hover:bg-[#E8E8ED] dark:hover:bg-[#303034] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-all"
                title="Família da Fonte"
              >
                <Type size={14} />
                <span className="max-w-[75px] truncate">
                  {fontFamilies.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.label || 'Fonte'}
                </span>
                <ChevronDown size={12} className="opacity-50" />
              </button>
              <div className="absolute top-full left-0 mt-2 bg-white/95 dark:bg-[#202023]/95 backdrop-blur-xl border border-[#D2D2D7] dark:border-[#38383A] rounded-xl shadow-2xl hidden group-hover:block z-20 min-w-[140px] p-1 scale-in-center">
                {fontFamilies.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => editor.chain().focus().setFontFamily(f.value).run()}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all ${
                      editor.isActive('textStyle', { fontFamily: f.value }) 
                        ? 'bg-[#009BDB] text-white' 
                        : 'text-[#424245] dark:text-[#D1D1D6] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F]'
                    }`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-4 bg-[#D2D2D7] dark:bg-[#38383A] mx-0.5" />

            {/* Tamanho da Fonte */}
            <div className="relative group">
              <button 
                type="button"
                className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium text-[#424245] dark:text-[#C7C7CC] hover:bg-[#E8E8ED] dark:hover:bg-[#303034] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-all"
                title="Tamanho da Fonte"
              >
                <SizeIcon size={14} />
                <span>{editor.getAttributes('textStyle').fontSize || '16px'}</span>
                <ChevronDown size={12} className="opacity-50" />
              </button>
              <div className="absolute top-full left-0 mt-2 bg-white/95 dark:bg-[#202023]/95 backdrop-blur-xl border border-[#D2D2D7] dark:border-[#38383A] rounded-xl shadow-2xl hidden group-hover:block z-20 min-w-[100px] p-1 scale-in-center">
                {fontSizes.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => editor.chain().focus().setFontSize(s.value).run()}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all ${
                      editor.getAttributes('textStyle').fontSize === s.value 
                        ? 'bg-[#009BDB] text-white' 
                        : 'text-[#424245] dark:text-[#D1D1D6] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
                <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A] my-1 mx-2" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetFontSize().run()}
                  className="w-full text-left px-3 py-2 text-xs rounded-md text-[#FF3B30] hover:bg-[#FF3B30]/10 italic"
                >
                  Resetar
                </button>
              </div>
            </div>
          </div>

          <div className="w-px h-6 bg-[#D2D2D7] dark:bg-[#333336] mx-1" />

          {/* Listas & Citação */}
          <div className="flex items-center bg-[#E8E8ED]/50 dark:bg-[#222225] p-1 rounded-lg border border-transparent dark:border-[#2F2F33]">
            <ToolbarButton 
              active={editor.isActive('bulletList')} 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              icon={<List size={16} />} 
              title="Lista com Marcadores"
            />
            <ToolbarButton 
              active={editor.isActive('orderedList')} 
              onClick={() => editor.chain().focus().toggleOrderedList().run()} 
              icon={<ListOrdered size={16} />} 
              title="Lista Numerada"
            />
            <ToolbarButton 
              active={editor.isActive('taskList')} 
              onClick={() => editor.chain().focus().toggleTaskList().run()} 
              icon={<CheckSquare size={16} />} 
              title="Checklist Interativo"
            />
            <ToolbarButton 
              active={editor.isActive('blockquote')} 
              onClick={() => editor.chain().focus().toggleBlockquote().run()} 
              icon={<Quote size={16} />} 
              title="Citação"
            />
          </div>

          <div className="w-px h-6 bg-[#D2D2D7] dark:bg-[#333336] mx-1" />

          {/* Recursos de Conteúdo (Tabela & Modelos) */}
          <div className="flex items-center bg-[#E8E8ED]/50 dark:bg-[#222225] p-1 rounded-lg border border-transparent dark:border-[#2F2F33]">
            {/* Tabelas */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowTableMenu(!showTableMenu)}
                className={`h-8 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-all ${
                  showTableMenu || editor.isActive('table') 
                    ? 'bg-[#009BDB] text-white shadow-xs' 
                    : 'hover:bg-[#E8E8ED] dark:hover:bg-[#303034] text-[#424245] dark:text-[#C7C7CC] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
                title="Inserir e gerenciar tabelas"
              >
                <TableIcon size={14} />
                <span>Tabela</span>
                <ChevronDown size={12} className="opacity-50" />
              </button>
              {showTableMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white/95 dark:bg-[#202023]/95 backdrop-blur-xl border border-[#D2D2D7] dark:border-[#38383A] rounded-xl shadow-2xl z-20 p-3 min-w-[240px] scale-in-center">
                  <div className="grid grid-cols-1 gap-1">
                    <p className="text-[10px] text-[#86868B] dark:text-[#8E8E93] mb-1 font-bold uppercase tracking-wider">Inserir Grade</p>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(r => (
                        [1, 2, 3, 4, 5].map(c => (
                          <button
                            key={`${r}-${c}`}
                            type="button"
                            className="w-6 h-6 border border-[#D2D2D7] dark:border-[#38383A] hover:bg-[#009BDB] hover:border-[#009BDB] transition-all rounded-xs"
                            onClick={() => insertTable(c, r)}
                            title={`${r}x${c}`}
                          />
                        ))
                      )).flat()} 
                    </div>
                    <button type="button" onClick={() => insertTable(3, 3)} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F] rounded text-[#1D1D1F] dark:text-[#F5F5F7]">3x3 Padrão</button>
                    <button type="button" onClick={() => insertTable(2, 4)} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F] rounded text-[#1D1D1F] dark:text-[#F5F5F7]">2x4 Padrão</button>
                    
                    {editor.isActive('table') && (
                      <>
                        <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A] my-1" />
                        <p className="text-[10px] text-[#86868B] dark:text-[#8E8E93] mb-1 font-bold uppercase tracking-wider">Controles de Tabela</p>
                        <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F] rounded flex items-center gap-2 text-[#1D1D1F] dark:text-[#F5F5F7]"><Plus size={12} /> Add Coluna Antes</button>
                        <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F] rounded flex items-center gap-2 text-[#1D1D1F] dark:text-[#F5F5F7]"><Plus size={12} /> Add Coluna Depois</button>
                        <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F] rounded flex items-center gap-2 text-[#1D1D1F] dark:text-[#F5F5F7]"><Plus size={12} /> Add Linha Antes</button>
                        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2F] rounded flex items-center gap-2 text-[#1D1D1F] dark:text-[#F5F5F7]"><Plus size={12} /> Add Linha Depois</button>
                        <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="text-left px-2 py-1 text-xs hover:bg-[#FF3B30]/10 text-[#FF3B30] rounded flex items-center gap-2"><Trash2 size={12} /> Excluir Coluna</button>
                        <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="text-left px-2 py-1 text-xs hover:bg-[#FF3B30]/10 text-[#FF3B30] rounded flex items-center gap-2"><Trash2 size={12} /> Excluir Linha</button>
                        <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="text-left px-2 py-1 text-xs bg-[#FF3B30] text-white rounded mt-1">Excluir Tabela</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-[#D2D2D7] dark:bg-[#38383A] mx-0.5" />

            {/* Modelos Rápidos */}
            <button
              type="button"
              onClick={() => setShowTemplatesBar((prev) => !prev)}
              className={`h-8 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-all ${
                showTemplatesBar
                  ? 'bg-[#009BDB] text-white shadow-xs'
                  : 'hover:bg-[#E8E8ED] dark:hover:bg-[#303034] text-[#424245] dark:text-[#C7C7CC] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
              title="Modelos Prontos de Manutenção"
            >
              <Sparkles size={14} className={showTemplatesBar ? 'text-white' : 'text-[#009BDB]'} />
              <span>Modelos</span>
            </button>
          </div>

          <div className="flex-1" />

          {/* Histórico Desfazer / Refazer */}
          <div className="flex items-center bg-[#E8E8ED]/50 dark:bg-[#222225] p-1 rounded-lg border border-transparent dark:border-[#2F2F33]">
            <ToolbarButton 
              onClick={() => editor.chain().focus().undo().run()} 
              disabled={!editor.can().undo()}
              icon={<Undo size={16} />} 
              title="Desfazer"
            />
            <ToolbarButton 
              onClick={() => editor.chain().focus().redo().run()} 
              disabled={!editor.can().redo()}
              icon={<Redo size={16} />} 
              title="Refazer"
            />
          </div>
        </div>
      )}

      {/* Conteúdo do Editor */}
      <div className="printable-content flex-1 overflow-y-auto p-8 bg-white dark:bg-[#141416] transition-colors">
        <div className={`max-w-4xl mx-auto w-full prose prose-slate dark:prose-invert ${mode === 'preview' ? 'markdown-body' : ''}`}>
          {/* Cabeçalho A4 exclusivo para Impressão */}
          <div className="print-only mb-6 pb-3 border-b-2 border-[#009BDB]">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-bold tracking-wider uppercase text-[#009BDB]">
                ATMaintenance • Instruções de Manutenção
              </span>
              <span>Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight m-0">
              {siteName || 'Instruções de Manutenção'}
            </h1>
          </div>

          {/* Banner de Modelos Rápidos (apenas tela no modo edição) */}
          {mode === 'edit' && showTemplatesBar && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="no-print mb-6 p-4 rounded-2xl bg-[#F5F5F7]/90 dark:bg-[#1C1C1E]/95 backdrop-blur-md border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[#009BDB]/10 text-[#009BDB]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] m-0">
                      Modelos Rápidos de Manutenção
                    </h3>
                    <p className="text-xs text-[#86868B] dark:text-[#8E8E93] m-0">
                      Preencha o roteiro com checklists e acessos em 1 clique
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplatesBar(false)}
                  className="text-xs text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] px-2.5 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Ocultar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MAINTENANCE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#252528] hover:bg-[#F0F8FF] dark:hover:bg-[#1E293B] border border-[#D2D2D7]/60 dark:border-[#38383A] hover:border-[#009BDB] dark:hover:border-[#009BDB] text-left transition-all group shadow-2xs active:scale-[0.99]"
                  >
                    <span className="text-2xl shrink-0 p-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1A1A1D] group-hover:scale-110 transition-transform">
                      {tmpl.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#009BDB] transition-colors truncate">
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#333336] text-gray-600 dark:text-gray-300 shrink-0">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#86868B] dark:text-[#8E8E93] line-clamp-2 leading-relaxed m-0">
                        {tmpl.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <EditorContent editor={editor} />

          {/* Rodapé A4 exclusivo para Impressão */}
          <div className="print-only mt-10 pt-4 border-t border-gray-200 flex items-center justify-between text-[8.5pt] text-gray-400">
            <span>ATMaintenance - Gestor de Instruções</span>
            <span>Documento técnico de uso operacional</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ 
  active = false, 
  onClick, 
  icon, 
  title,
  disabled = false
}: { 
  active?: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-w-[32px] h-8 px-2 flex items-center justify-center transition-all rounded-md ${
        active 
          ? 'bg-[#009BDB] text-white shadow-xs' 
          : 'hover:bg-[#E8E8ED] dark:hover:bg-[#303034] text-[#424245] dark:text-[#C7C7CC] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
      } disabled:opacity-20 disabled:pointer-events-none active:scale-90`}
    >
      {icon}
    </button>
  );
}
