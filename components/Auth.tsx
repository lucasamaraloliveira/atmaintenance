'use client';

import { auth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { LogIn, LogOut, User } from 'lucide-react';
import Image from 'next/image';

export default function Auth({ user }: { user: any }) {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 p-4 border-t border-[#D2D2D7]">
        <div className="relative w-10 h-10 rounded-full bg-[#E8E8ED] flex items-center justify-center overflow-hidden border border-[#D2D2D7]">
          {user.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="text-[#86868B]" size={20} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.displayName}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-[#009BDB] hover:underline flex items-center gap-1"
          >
            <LogOut size={12} /> Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Bem-vindo ao ATMaintenance</h2>
      <p className="text-[#86868B] mb-6">Entre com sua conta Google para gerenciar suas instruções de manutenção.</p>
      <button onClick={handleLogin} className="apple-button w-full flex items-center justify-center gap-2">
        <LogIn size={18} /> Entrar com Google
      </button>
    </div>
  );
}
