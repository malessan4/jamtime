// app/page.tsx
'use client';

import React, { useState } from 'react';
import { createGroup, joinGroupByCode } from './actions';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    // El Server Action maneja la redirección internamente
    await createGroup(newGroupName);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setIsJoining(true);

    const res = await joinGroupByCode(roomCode);
    if (res.success && res.groupId) {
      router.push(`/${res.groupId}`);
    } else {
      alert(res.error);
      setIsJoining(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">JamTime</h1>
          <p className="text-slate-400 text-sm">Sincroniza los horarios de tu banda</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Formulario 1: Unirse con Código */}
          <form onSubmit={handleJoin} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ya tengo una banda</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Código de 6 letras"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-center font-mono font-bold text-lg text-black uppercase"
              />
              <button
                type="submit"
                disabled={isJoining || roomCode.length < 5}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {isJoining ? '...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-100"></div>

          {/* Formulario 2: Crear Banda */}
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Crear nueva banda</h2>
            <input
              type="text"
              placeholder="Nombre del proyecto"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 text-black"
            />
            <button
              type="submit"
              disabled={isCreating || !newGroupName.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {isCreating ? 'Iniciando...' : 'Crear Proyecto'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}