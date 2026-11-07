'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import Auth from '@/components/Auth';
import ConfirmModal from '@/components/ConfirmModal';
import UndoToast from '@/components/UndoToast';
import FloatingActions from '@/components/FloatingActions';
import { Loader2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<any | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setInstructions([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Consulta sem orderBy composto para evitar erro de índice ausente no Firestore
    const q = query(
      collection(db, 'instructions'),
      where('authorUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Ordena em memória por data de atualização decrescente
      docs.sort((a: any, b: any) => {
        const getTime = (item: any) => {
          if (item.updatedAt?.toMillis) return item.updatedAt.toMillis();
          if (item.updatedAt?.seconds) return item.updatedAt.seconds * 1000;
          if (item.updatedAt instanceof Date) return item.updatedAt.getTime();
          if (item.createdAt?.toMillis) return item.createdAt.toMillis();
          if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
          return 0;
        };
        return getTime(b) - getTime(a);
      });

      setInstructions(docs);
    }, (error) => {
      console.error('Erro ao buscar instruções:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNew = useCallback(async () => {
    if (!user || isCreating) {
      if (!user) alert('Você precisa estar conectado para criar uma instrução.');
      return;
    }

    setIsCreating(true);
    try {
      const now = new Date();
      const newInstructionData = {
        siteName: 'Novo Site',
        content: '<h1>Instruções de Manutenção</h1><p>Descreva aqui as instruções...</p>',
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'instructions'), newInstructionData);

      // Inserção otimista imediata para atualizar a barra lateral na hora
      const optimisticDoc = {
        id: docRef.id,
        ...newInstructionData,
        createdAt: now,
        updatedAt: now,
      };

      setInstructions((prev) => {
        if (prev.some((i) => i.id === docRef.id)) return prev;
        return [optimisticDoc, ...prev];
      });

      setSelectedId(docRef.id);
    } catch (error: any) {
      console.error('Erro ao criar instrução:', error);
      alert('Erro ao criar instrução no Firebase: ' + (error?.message || 'Verifique sua conexão ou regras do banco de dados.'));
    } finally {
      setIsCreating(false);
    }
  }, [user, isCreating]);

  // Atalhos Globais de Navegação (Ctrl+K para buscar, Ctrl+N / Alt+N para nova instrução)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;

      // Ctrl + K ou Cmd + K: Abrir e focar no campo de busca de sites
      if (isModifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSidebarOpen(true);
        setTimeout(() => {
          const searchInput = document.getElementById('sidebar-search-input') as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }, 100);
        return;
      }

      // Ctrl + N ou Alt + N: Criar nova instrução instantaneamente
      if ((isModifier || e.altKey) && e.key.toLowerCase() === 'n') {
        // Se estiver num input editando texto, e pressionar Alt+N, cria nova instrução
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (isModifier && (activeTag === 'input' || activeTag === 'textarea')) {
          // Permite digitação comum se não for atalho intencional
        }
        e.preventDefault();
        handleNew();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNew]);

  const handleImport = async (data: { siteName: string; content: string }) => {
    if (!user) return;
    try {
      const now = new Date();
      const newInstructionData = {
        siteName: data.siteName,
        content: data.content,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'instructions'), newInstructionData);

      const optimisticDoc = {
        id: docRef.id,
        ...newInstructionData,
        createdAt: now,
        updatedAt: now,
      };

      setInstructions((prev) => {
        if (prev.some((i) => i.id === docRef.id)) return prev;
        return [optimisticDoc, ...prev];
      });

      setSelectedId(docRef.id);
    } catch (error: any) {
      console.error('Erro ao importar instrução:', error);
      alert('Erro ao importar instrução: ' + (error?.message || 'Erro inesperado.'));
    }
  };

  const handleSave = async (data: { siteName: string; content: string }) => {
    if (!selectedId || !user) return;
    try {
      // Atualiza localmente de imediato
      setInstructions((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, ...data, updatedAt: new Date() }
            : item
        )
      );

      await updateDoc(doc(db, 'instructions', selectedId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Erro ao salvar instrução:', error);
      alert('Erro ao salvar instrução: ' + (error?.message || error));
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = useCallback(async () => {
    if (!deletingId || !user) return;
    
    const instructionToDelete = instructions.find((i) => i.id === deletingId);
    if (!instructionToDelete) return;

    try {
      setLastDeleted(instructionToDelete);
      // Remove da lista instantaneamente (otimista)
      setInstructions((prev) => prev.filter((i) => i.id !== deletingId));
      if (selectedId === deletingId) setSelectedId(null);
      setShowUndo(true);

      await deleteDoc(doc(db, 'instructions', deletingId));
    } catch (error: any) {
      console.error('Erro ao excluir instrução:', error);
      alert('Erro ao excluir instrução: ' + (error?.message || error));
      // Restaura caso falhe
      setInstructions((prev) => [instructionToDelete, ...prev]);
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, user, instructions, selectedId]);

  const undoDelete = useCallback(async () => {
    if (!lastDeleted || !user) return;
    const itemToRestore = lastDeleted;
    setLastDeleted(null);
    setShowUndo(false);

    try {
      // Reinsere na interface imediatamente
      setInstructions((prev) => [itemToRestore, ...prev]);
      setSelectedId(itemToRestore.id);

      const { id, ...data } = itemToRestore;
      // Salva de volta com o mesmo ID
      await setDoc(doc(db, 'instructions', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao desfazer exclusão:', error);
      try {
        const { id, ...data } = itemToRestore;
        const restoredDoc = await addDoc(collection(db, 'instructions'), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        setSelectedId(restoredDoc.id);
      } catch (err) {
        console.error('Falha geral ao restaurar documento:', err);
      }
    }
  }, [lastDeleted, user]);

  const selectedInstruction = instructions.find((i) => i.id === selectedId) || null;

  const handleCloseUndo = useCallback(() => {
    setShowUndo(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F5F7] dark:bg-[#141416] transition-colors">
        <Loader2 className="animate-spin text-[#009BDB]" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F5F7] dark:bg-[#141416] p-4 transition-colors relative">
        <FloatingActions />
        <div className="w-full max-w-md apple-glass p-2 rounded-3xl shadow-2xl overflow-hidden border border-[#D2D2D7] dark:border-[#38383A]">
          <Auth user={null} />
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex overflow-hidden relative bg-[#F5F5F7] dark:bg-[#141416] transition-colors duration-300">
      {/* Botões Flutuantes (Tema, Importar MD, Exportar MD) */}
      <FloatingActions
        currentInstruction={selectedInstruction}
        onImport={handleImport}
      />

      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="no-print flex flex-col h-full border-r border-[#D2D2D7] dark:border-[#28282B] overflow-hidden"
          >
            <div className="flex-1 overflow-hidden no-print">
              <Sidebar
                instructions={instructions}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onNew={handleNew}
                onDelete={handleDelete}
                onClose={() => setIsSidebarOpen(false)}
                isCreating={isCreating}
              />
            </div>
            <Auth user={user} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 h-full overflow-hidden relative">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="no-print absolute top-4 left-4 z-50 p-2 rounded-full bg-white/80 dark:bg-[#202023]/80 backdrop-blur-md border border-[#D2D2D7] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-all shadow-xs"
            title="Abrir Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <Editor
          key={selectedId || 'new'}
          instruction={selectedInstruction}
          onSave={handleSave}
          isSidebarCollapsed={!isSidebarOpen}
        />
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Instrução"
        message="Tem certeza que deseja excluir esta instrução? Esta ação não pode ser desfeita, mas você terá alguns segundos para restaurar."
      />

      {/* Toast Flutuante com Botão Desfazer */}
      <UndoToast
        isVisible={showUndo}
        onUndo={undoDelete}
        onClose={handleCloseUndo}
        message="Instrução excluída com sucesso."
      />
    </main>
  );
}
