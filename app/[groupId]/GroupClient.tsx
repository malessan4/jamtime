// app/[groupId]/GroupClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CalendarClient from '../components/CalendarClient';
import { createUser } from '../actions';

interface User {
    id: string;
    name: string;
    color: string;
}

interface GroupClientProps {
    groupId: string;
    groupName: string;
    dbUsers: User[];
    serializedEvents: { title: string; start: string; end: string; color: string }[];
}

const PRESET_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function GroupClient({ groupId, groupName, dbUsers, serializedEvents }: GroupClientProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Buscamos si este usuario ya tiene una sesión guardada localmente para este grupo
        const savedUserId = localStorage.getItem(`jamtime_user_${groupId}`);
        if (savedUserId) {
            const match = dbUsers.find(u => u.id === savedUserId);
            if (match) setCurrentUser(match);
        }
        setLoading(false);
    }, [groupId, dbUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const res = await createUser(name.trim(), color, groupId);

        if (res.success && res.user) {
            localStorage.setItem(`jamtime_user_${groupId}`, res.user.id);
            setCurrentUser(res.user);
        } else {
            alert('Error al registrarte en el grupo.');
        }
        setIsSubmitting(false);
    };

    // Rehidratamos las strings ISO de las fechas a objetos Date reales para react-big-calendar
    const parsedEvents = serializedEvents.map(e => ({
        title: e.title,
        color: e.color,
        start: new Date(e.start),
        end: new Date(e.end),
    }));

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-slate-50 text-black">Cargando grupo...</div>;
    }

    if (!currentUser) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 p-4 text-black">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
                    <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">Unirse a {groupName}</h1>
                    <p className="text-sm text-slate-500 text-center mb-6">Ingresa tu nombre y elige el color con el que pintarás tus horarios libres.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-700">Tu Nombre / Instrumento</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej. Matias (Guitarra)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-700">Tu Color de Calendario</label>
                            <div className="grid grid-cols-6 gap-3">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        style={{ backgroundColor: c }}
                                        className={`h-10 w-10 rounded-xl transition-all ${color === c ? 'ring-4 ring-slate-800 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar al Calendario'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h1 className="text-xl font-bold">{groupName}</h1>
                        <p className="text-xs text-slate-400">Comparte el enlace actual de tu navegador para invitar a tu banda.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentUser.color }} />
                        <span className="text-sm font-medium text-slate-200">{currentUser.name}</span>
                    </div>
                </div>
                <CalendarClient
                    initialEvents={parsedEvents}
                    currentUserId={currentUser.id}
                    currentUserColor={currentUser.color}
                    currentUserName={currentUser.name}
                    groupId={groupId}
                />
            </div>
        </main>
    );
}