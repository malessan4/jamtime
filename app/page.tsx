// app/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGroup } from './actions';

export default function Home() {
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || isCreating) return;

    setIsCreating(true);
    const res = await createGroup(groupName.trim());

    if (res.success && res.group) {
      // Redirigimos automáticamente a la ruta dinámica del grupo recién creado
      router.push(`/${res.group.id}`);
    } else {
      alert('Ocurrió un error al intentar inicializar el grupo.');
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-6">
          <span className="text-4xl">🎸</span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">JamTime</h1>
          <p className="text-slate-400 text-sm mt-1">Coordina los ensayos de tu banda sin vueltas.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Nombre de la Banda o Grupo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Mi Banda de Rock / Ensayo de Junio"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isCreating ? 'Inicializando espacio...' : 'Crear Calendario Compartido'}
          </button>
        </form>
      </div>
    </div>
  );
}