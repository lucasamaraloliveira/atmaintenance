'use client';

import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-white dark:bg-[#202023] rounded-3xl shadow-2xl overflow-hidden border border-[#D2D2D7] dark:border-[#38383A] transition-colors"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#FF3B30]">
                <div className="p-2 rounded-full bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</h3>
              </div>
              
              <p className="text-[#86868B] dark:text-[#8E8E93] text-sm leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#D2D2D7] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FF3B30] text-white font-medium hover:bg-[#D72C21] transition-all shadow-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
