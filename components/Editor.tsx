'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { FontSize } from '@/lib/tiptap-extensions';
import { marked } from 'marked';
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
  Quote,
  Undo,
  Redo,
  Plus,
  Trash2
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
  onSave: (data: { siteName: string; content: string }) => void;
  isSidebarCollapsed?: boolean;
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>(instruction ? 'preview' : 'edit');
  const [siteName, setSiteName] = useState(instruction?.siteName || '');
  const [showTableMenu, setShowTableMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
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
    onUpdate: ({ editor }) => {
      // We don't need to sync state on every keystroke if we save on button click,
      // but if we want to keep things in sync, we could.
    },
  });

  useEffect(() => {
    if (editor && instruction) {
      let htmlContent = instruction.content;
      // Simple heuristic: if it doesn't look like HTML, treat as Markdown
      if (!htmlContent.trim().startsWith('<') && !htmlContent.includes('</')) {
        htmlContent = marked.parse(htmlContent) as string;
      }
      editor.commands.setContent(htmlContent);
      setSiteName(instruction.siteName);
    }
  }, [instruction, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(mode === 'edit');
    }
  }, [mode, editor]);

  const handleSave = () => {
    if (editor) {
      onSave({
        siteName,
        content: editor.getHTML(),
      });
    }
  };

  const insertTable = (cols: number, rows: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableMenu(false);
  };

  if (!instruction && siteName === '' && (!editor || editor.isEmpty)) {
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
      {/* Header */}
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
            disabled={mode === 'preview'}
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
            onClick={handleSave}
            className="apple-button flex items-center gap-2"
          >
            <Save size={18} /> Salvar
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {mode === 'edit' && editor && (
        <div className={`px-4 py-2 border-b border-[#D2D2D7] bg-[#F5F5F7] flex flex-wrap items-center gap-1 sticky top-[73px] z-10 transition-all ${
          isSidebarCollapsed ? 'pl-16' : 'pl-4'
        }`}>
          {/* Text Formatting */}
          <div className="flex items-center bg-white border border-[#D2D2D7] rounded-md overflow-hidden">
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

          <div className="w-px h-6 bg-[#D2D2D7] mx-1" />

          {/* Font Family */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1 bg-white border border-[#D2D2D7] rounded-md text-xs font-medium hover:bg-[#F5F5F7]">
              <Type size={14} />
              <span className="max-w-[80px] truncate">
                {fontFamilies.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.label || 'Fonte'}
              </span>
              <ChevronDown size={12} />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#D2D2D7] rounded-md shadow-lg hidden group-hover:block z-20 min-w-[120px]">
              {fontFamilies.map(f => (
                <button
                  key={f.value}
                  onClick={() => editor.chain().focus().setFontFamily(f.value).run()}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#E8E8ED] ${
                    editor.isActive('textStyle', { fontFamily: f.value }) ? 'bg-[#E8E8ED] font-bold' : ''
                  }`}
                  style={{ fontFamily: f.value }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1 bg-white border border-[#D2D2D7] rounded-md text-xs font-medium hover:bg-[#F5F5F7]">
              <SizeIcon size={14} />
              <span>{editor.getAttributes('textStyle').fontSize || '16px'}</span>
              <ChevronDown size={12} />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#D2D2D7] rounded-md shadow-lg hidden group-hover:block z-20 min-w-[80px]">
              {fontSizes.map(s => (
                <button
                  key={s.value}
                  onClick={() => editor.chain().focus().setFontSize(s.value).run()}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#E8E8ED] ${
                    editor.getAttributes('textStyle').fontSize === s.value ? 'bg-[#E8E8ED] font-bold' : ''
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => editor.chain().focus().unsetFontSize().run()}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[#E8E8ED] border-t border-[#D2D2D7] italic"
              >
                Resetar
              </button>
            </div>
          </div>

          <div className="w-px h-6 bg-[#D2D2D7] mx-1" />

          {/* Lists & Bloquote */}
          <div className="flex items-center bg-white border border-[#D2D2D7] rounded-md overflow-hidden">
            <ToolbarButton 
              active={editor.isActive('bulletList')} 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              icon={<List size={16} />} 
              title="Lista"
            />
            <ToolbarButton 
              active={editor.isActive('orderedList')} 
              onClick={() => editor.chain().focus().toggleOrderedList().run()} 
              icon={<ListOrdered size={16} />} 
              title="Lista Numerada"
            />
            <ToolbarButton 
              active={editor.isActive('blockquote')} 
              onClick={() => editor.chain().focus().toggleBlockquote().run()} 
              icon={<Quote size={16} />} 
              title="Citação"
            />
          </div>

          <div className="w-px h-6 bg-[#D2D2D7] mx-1" />

          {/* Tables */}
          <div className="relative">
            <button 
              onClick={() => setShowTableMenu(!showTableMenu)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                showTableMenu || editor.isActive('table') ? 'bg-[#009BDB] text-white' : 'bg-white border border-[#D2D2D7] hover:bg-[#F5F5F7]'
              }`}
            >
              <TableIcon size={16} />
              <span>Tabela</span>
              <ChevronDown size={12} />
            </button>
            {showTableMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#D2D2D7] rounded-md shadow-lg z-20 p-2 min-w-[200px]">
                <div className="grid grid-cols-1 gap-1">
                  <p className="text-[10px] text-[#86868B] mb-1 font-bold uppercase tracking-wider">Inserir Grade</p>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(r => (
                      [1, 2, 3, 4, 5].map(c => (
                        <button
                          key={`${r}-${c}`}
                          className="w-6 h-6 border border-[#D2D2D7] hover:bg-[#009BDB] hover:border-[#009BDB] transition-all rounded-sm"
                          onClick={() => insertTable(c, r)}
                          title={`${r}x${c}`}
                        />
                      ))
                    )).flat()} 
                  </div>
                  <button onClick={() => insertTable(3, 3)} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] rounded">3x3 Padrão</button>
                  <button onClick={() => insertTable(2, 4)} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] rounded">2x4 Padrão</button>
                  
                  {editor.isActive('table') && (
                    <>
                      <div className="h-px bg-[#D2D2D7] my-1" />
                      <p className="text-[10px] text-[#86868B] mb-1 font-bold uppercase tracking-wider">Controles de Tabela</p>
                      <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] rounded flex items-center gap-2"><Plus size={12} /> Add Coluna Antes</button>
                      <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] rounded flex items-center gap-2"><Plus size={12} /> Add Coluna Depois</button>
                      <button onClick={() => editor.chain().focus().addRowBefore().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] rounded flex items-center gap-2"><Plus size={12} /> Add Linha Antes</button>
                      <button onClick={() => editor.chain().focus().addRowAfter().run()} className="text-left px-2 py-1 text-xs hover:bg-[#E8E8ED] rounded flex items-center gap-2"><Plus size={12} /> Add Linha Depois</button>
                      <button onClick={() => editor.chain().focus().deleteColumn().run()} className="text-left px-2 py-1 text-xs hover:bg-[#FF3B30]/10 text-[#FF3B30] rounded flex items-center gap-2"><Trash2 size={12} /> Excluir Coluna</button>
                      <button onClick={() => editor.chain().focus().deleteRow().run()} className="text-left px-2 py-1 text-xs hover:bg-[#FF3B30]/10 text-[#FF3B30] rounded flex items-center gap-2"><Trash2 size={12} /> Excluir Linha</button>
                      <button onClick={() => editor.chain().focus().deleteTable().run()} className="text-left px-2 py-1 text-xs bg-[#FF3B30] text-white rounded mt-1">Excluir Tabela</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* History */}
          <div className="flex items-center bg-white border border-[#D2D2D7] rounded-md overflow-hidden">
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

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className={`max-w-4xl mx-auto w-full prose prose-slate ${mode === 'preview' ? 'markdown-body' : ''}`}>
          <EditorContent editor={editor} />
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
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 transition-all ${
        active 
          ? 'bg-[#009BDB] text-white' 
          : 'hover:bg-[#E8E8ED] text-[#1D1D1F]'
      } disabled:opacity-30`}
    >
      {icon}
    </button>
  );
}
