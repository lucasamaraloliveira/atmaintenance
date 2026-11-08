'use client';

import { Plus, Search, FileText, Trash2, PanelLeftClose, Loader2, Pin, Copy } from 'lucide-react';
import { useState } from 'react';

export interface SidebarInstruction {
  id: string;
  siteName: string;
  updatedAt: any;
  isPinned?: boolean;
}

export default function Sidebar({
  instructions,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  onDuplicate,
  onTogglePin,
  onClose,
  isCreating = false,
}: {
  instructions: SidebarInstruction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onTogglePin: (id: string) => void;
  onClose: () => void;
  isCreating?: boolean;
}) {
  const [search, setSearch] = useState('');

  const filtered = instructions.filter((i) =>
    i.siteName.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedItems = filtered.filter((i) => i.isPinned);
  const otherItems = filtered.filter((i) => !i.isPinned);

  const renderItem = (item: SidebarInstruction) => {
    const isSelected = selectedId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`group flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
          isSelected
            ? 'bg-[#009BDB] text-white shadow-xs'
            : 'hover:bg-[#E8E8ED] dark:hover:bg-[#222225] text-[#1D1D1F] dark:text-[#F5F5F7]'
        }`}
      >
        <FileText
          size={17}
          className={`shrink-0 ${
            isSelected ? 'text-white' : item.isPinned ? 'text-[#009BDB]' : 'text-[#86868B] dark:text-[#8E8E93]'
          }`}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate flex items-center gap-1.5">
            <span>{item.siteName}</span>
          </p>
          <p
            className={`text-[10px] ${
              isSelected ? 'text-white/75' : 'text-[#86868B] dark:text-[#8E8E93]'
            }`}
          >
            {item.updatedAt?.toDate
              ? item.updatedAt.toDate().toLocaleDateString('pt-BR')
              : item.updatedAt instanceof Date
              ? item.updatedAt.toLocaleDateString('pt-BR')
              : 'Hoje'}
          </p>
        </div>

        {/* Ações do Item */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Botão Fixar / Desafixar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(item.id);
            }}
            className={`p-1.5 rounded-lg transition-all ${
              item.isPinned
                ? isSelected
                  ? 'text-amber-200 hover:bg-white/20'
                  : 'text-amber-500 hover:bg-amber-500/10'
                : isSelected
                ? 'opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:bg-white/20 text-white'
                : 'opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:bg-[#D2D2D7] dark:hover:bg-[#3A3A3C] text-[#86868B] dark:text-[#8E8E93] hover:text-[#009BDB]'
            }`}
            title={item.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
          >
            <Pin size={13} className={item.isPinned ? 'rotate-45 fill-current' : 'rotate-45'} />
          </button>

          {/* Botão Duplicar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(item.id);
            }}
            className={`p-1.5 rounded-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all ${
              isSelected
                ? 'hover:bg-white/20 text-white'
                : 'hover:bg-[#D2D2D7] dark:hover:bg-[#3A3A3C] text-[#86868B] dark:text-[#8E8E93] hover:text-[#009BDB]'
            }`}
            title="Duplicar instrução (Clonar)"
          >
            <Copy size={13} />
          </button>

          {/* Botão Excluir */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className={`p-1.5 rounded-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all ${
              isSelected
                ? 'hover:bg-white/20 text-white'
                : 'hover:bg-[#D2D2D7] dark:hover:bg-[#3A3A3C] text-[#FF3B30]'
            }`}
            title="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="no-print w-80 h-full flex flex-col bg-[#F5F5F7]/80 dark:bg-[#18181B]/90 backdrop-blur-xl transition-colors duration-300">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#86868B] dark:text-[#A1A1A6] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-all"
              title="Recolher Menu"
            >
              <PanelLeftClose size={18} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              ATMaintenance
            </h1>
          </div>
          <button
            type="button"
            onClick={onNew}
            disabled={isCreating}
            className="p-2 rounded-full bg-white dark:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#009BDB] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] transition-all shadow-xs disabled:opacity-50 active:scale-95"
            title="Nova Instrução (Ctrl+N)"
          >
            {isCreating ? <Loader2 size={20} className="animate-spin text-[#009BDB]" /> : <Plus size={20} />}
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B] dark:text-[#8E8E93]"
            size={16}
          />
          <input
            id="sidebar-search-input"
            type="text"
            placeholder="Buscar site..."
            className="w-full pl-10 pr-14 py-2 rounded-lg bg-[#E8E8ED] dark:bg-[#222225] border border-transparent dark:border-[#38383A]/50 focus:ring-2 focus:ring-[#009BDB] outline-none text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] dark:placeholder:text-[#8E8E93] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white/80 dark:bg-[#2D2D30] text-[#86868B] dark:text-[#A1A1A6] font-mono px-1.5 py-0.5 rounded border border-[#D2D2D7]/70 dark:border-[#38383A] pointer-events-none select-none shadow-2xs">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[#86868B] dark:text-[#8E8E93] text-sm italic">
            Nenhuma instrução encontrada.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Seção de Fixados */}
            {pinnedItems.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#009BDB]">
                  <Pin size={11} className="rotate-45 fill-current" />
                  <span>Fixados ({pinnedItems.length})</span>
                </div>
                {pinnedItems.map((item) => renderItem(item))}
              </div>
            )}

            {/* Seção de Demais Instruções */}
            <div className="space-y-1">
              {pinnedItems.length > 0 && otherItems.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93]">
                  <span>Todos os Sites ({otherItems.length})</span>
                </div>
              )}
              {otherItems.map((item) => renderItem(item))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
