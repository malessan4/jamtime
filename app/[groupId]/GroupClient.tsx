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
    serializedEvents: {
        id: string;
        userId: string;
        title: string;
        start: string;
        end: string;
        color: string
    }[];
}

const PRESET_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function GroupClient({ groupId, groupName, dbUsers, serializedEvents }: GroupClientProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Nuevo: Estado para manejar si el usuario se está registrando o está reingresando
    const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

    const [name, setName] = useState('');

    const takenColors = dbUsers.map(u => u.color);
    const defaultAvailableColor = PRESET_COLORS.find(c => !takenColors.includes(c)) || PRESET_COLORS[0];
    const [color, setColor] = useState(defaultAvailableColor);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedUserId = localStorage.getItem(`jamtime_user_${groupId}`);
        if (savedUserId) {
            const match = dbUsers.find(u => u.id === savedUserId);
            if (match) setCurrentUser(match);
        } else if (dbUsers.length > 0) {
            // Si hay usuarios en la banda pero no hay sesión local, asumimos que podría querer hacer login
            setAuthMode('login');
        }
        setLoading(false);
    }, [groupId, dbUsers]);

    // Maneja la creación de un usuario nuevo
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const res = await createUser(name.trim(), color, groupId);

        if (res.success && res.user) {
            localStorage.setItem(`jamtime_user_${groupId}`, res.user.id);
            setCurrentUser(res.user);
        } else {
            alert(res.error || 'Error al registrarte en el grupo.');
        }
        setIsSubmitting(false);
    };

    // Maneja el reingreso de un usuario existente
    const handleLogin = (user: User) => {
        localStorage.setItem(`jamtime_user_${groupId}`, user.id);
        setCurrentUser(user);
    };

    const parsedEvents = serializedEvents.map(e => ({
        id: e.id,
        userId: e.userId,
        title: e.title,
        color: e.color,
        start: new Date(e.start),
        end: new Date(e.end),
    }));

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-slate-50 text-black">Cargando grupo...</div>;
    }

    // PANTALLA DE ACCESO (Registro o Login)
    if (!currentUser) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 p-4 text-black">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
                    <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">Unirse a {groupName}</h1>
                    <p className="text-sm text-slate-500 text-center mb-6">Identifícate para ver o modificar tus horarios de disponibilidad.</p>

                    {/* Pestañas de Navegación */}
                    <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => setAuthMode('login')}
                            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Ya soy miembro
                        </button>
                        <button
                            onClick={() => setAuthMode('register')}
                            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${authMode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Nuevo Integrante
                        </button>
                    </div>

                    {/* MODO LOGIN: Lista de usuarios existentes */}
                    {authMode === 'login' && (
                        <div className="space-y-3">
                            {dbUsers.length === 0 ? (
                                <p className="text-sm text-center text-slate-500 py-4">Aún no hay integrantes en este grupo.</p>
                            ) : (
                                dbUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleLogin(user)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
                                    >
                                        <span className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: user.color }} />
                                        <span className="font-semibold text-slate-700">{user.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* MODO REGISTRO: Formulario de creación */}
                    {authMode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-5">
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
                                    {PRESET_COLORS.map((c) => {
                                        const isTaken = takenColors.includes(c);

                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                disabled={isTaken}
                                                onClick={() => setColor(c)}
                                                style={{ backgroundColor: c }}
                                                className={`
                          h-10 w-10 rounded-xl transition-all flex items-center justify-center
                          ${isTaken ? 'opacity-20 cursor-not-allowed grayscale' : 'opacity-80 hover:opacity-100 cursor-pointer'}
                          ${color === c && !isTaken ? 'ring-4 ring-slate-800 scale-110 shadow-md' : ''}
                        `}
                                            >
                                                {isTaken && <span className="text-white text-xs font-bold shadow-sm">X</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || takenColors.includes(color)}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Entrando...' : 'Entrar al Calendario'}
                            </button>
                        </form>
                    )}
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