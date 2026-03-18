'use client';

import { Plus, Search, FileText, Trash2, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';

interface Instruction {
  id: string;
  siteName: string;
  updatedAt: any;
}

export default function Sidebar({
  instructions,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  onClose,
}: {
  instructions: Instruction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = instructions.filter((i) =>
    i.siteName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col bg-[#F5F5F7]/80 backdrop-blur-xl">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#E8E8ED] transition-all"
              title="Recolher Menu"
            >
              <PanelLeftClose size={18} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">ATMaintenance</h1>
          </div>
          <button
            onClick={onNew}
            className="p-2 rounded-full bg-white border border-[#D2D2D7] text-[#009BDB] hover:bg-[#E8E8ED] transition-all"
            title="Nova Instrução"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" size={16} />
          <input
            type="text"
            placeholder="Buscar site..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#E8E8ED] border-none focus:ring-2 focus:ring-[#009BDB] outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[#86868B] text-sm italic">
            Nenhuma instrução encontrada.
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedId === item.id
                    ? 'bg-[#009BDB] text-white'
                    : 'hover:bg-[#E8E8ED]'
                }`}
              >
                <FileText size={18} className={selectedId === item.id ? 'text-white' : 'text-[#86868B]'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.siteName}</p>
                  <p className={`text-[10px] ${selectedId === item.id ? 'text-white/70' : 'text-[#86868B]'}`}>
                    {item.updatedAt?.toDate().toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                    selectedId === item.id
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-[#D2D2D7] text-[#FF3B30]'
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
