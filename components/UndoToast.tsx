'use client';

import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, X } from 'lucide-react';
import { useEffect } from 'react';

interface UndoToastProps {
  isVisible: boolean;
  onUndo: () => void;
  onClose: () => void;
  message: string;
  duration?: number;
}

export default function UndoToast({ isVisible, onUndo, onClose, message, duration = 5000 }: UndoToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
        >
          <div className="bg-[#1D1D1F]/90 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-all"
              >
                <RotateCcw size={14} />
                Desfazer
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/50 hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
