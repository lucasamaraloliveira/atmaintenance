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
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import Auth from '@/components/Auth';
import ConfirmModal from '@/components/ConfirmModal';
import UndoToast from '@/components/UndoToast';
import { Loader2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

    const q = query(
      collection(db, 'instructions'),
      where('authorUid', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInstructions(docs);
    }, (error) => {
      console.error('Erro ao buscar instruções:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNew = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'instructions'), {
        siteName: 'Novo Site',
        content: '<h1>Instruções de Manutenção</h1><p>Descreva aqui as instruções...</p>',
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSelectedId(docRef.id);
    } catch (error) {
      console.error('Erro ao criar instrução:', error);
    }
  };

  const handleSave = async (data: { siteName: string; content: string }) => {
    if (!selectedId || !user) return;
    try {
      await updateDoc(doc(db, 'instructions', selectedId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao salvar instrução:', error);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = useCallback(async () => {
    if (!deletingId || !user) return;
    
    const instructionToDelete = instructions.find(i => i.id === deletingId);
    if (!instructionToDelete) return;

    try {
      setLastDeleted(instructionToDelete);
      await deleteDoc(doc(db, 'instructions', deletingId));
      if (selectedId === deletingId) setSelectedId(null);
      setShowUndo(true);
    } catch (error) {
      console.error('Erro ao excluir instrução:', error);
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, user, instructions, selectedId]);

  const undoDelete = useCallback(async () => {
    if (!lastDeleted || !user) return;
    try {
      const { id, ...data } = lastDeleted;
      // We use addDoc but we might want to keep the same ID if possible, 
      // but Firestore doesn't allow re-creating with same ID easily if it's auto-generated.
      // Actually we can use setDoc with the original ID.
      await addDoc(collection(db, 'instructions'), {
        ...data,
        updatedAt: serverTimestamp(), // Refresh update time
      });
      setLastDeleted(null);
      setShowUndo(false);
    } catch (error) {
      console.error('Erro ao desfazer exclusão:', error);
    }
  }, [lastDeleted, user]);

  const selectedInstruction = instructions.find((i) => i.id === selectedId) || null;

  const handleCloseUndo = useCallback(() => {
    setShowUndo(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F5F7]">
        <Loader2 className="animate-spin text-[#009BDB]" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F5F7]">
        <div className="w-full max-w-md apple-glass p-2 rounded-3xl shadow-2xl overflow-hidden border border-[#D2D2D7]">
          <Auth user={null} />
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex overflow-hidden relative">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="flex flex-col h-full border-r border-[#D2D2D7] overflow-hidden"
          >
            <div className="flex-1 overflow-hidden">
              <Sidebar
                instructions={instructions}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onNew={handleNew}
                onDelete={handleDelete}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
            <Auth user={user} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 h-full overflow-hidden relative">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur-md border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#E8E8ED] transition-all shadow-sm"
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

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Instrução"
        message="Tem certeza que deseja excluir esta instrução? Esta ação não pode ser desfeita, mas você terá alguns segundos para restaurar."
      />

      <UndoToast
        isVisible={showUndo}
        onUndo={undoDelete}
        onClose={handleCloseUndo}
        message="Instrução excluída com sucesso."
      />
    </main>
  );
}
