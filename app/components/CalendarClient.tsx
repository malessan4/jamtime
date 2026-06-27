// app/components/CalendarClient.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { addAvailability, deleteAvailability } from '../actions';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { es };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

interface AvailabilityEvent {
    id: string;
    userId: string;
    title: string;
    start: Date;
    end: Date;
    color: string;
}

interface CalendarClientProps {
    initialEvents: AvailabilityEvent[];
    currentUserId: string;
    currentUserColor: string;
    currentUserName: string;
    groupId: string;
}

export default function CalendarClient({
    initialEvents,
    currentUserId,
    currentUserColor,
    currentUserName,
    groupId
}: CalendarClientProps) {
    const [events, setEvents] = useState<AvailabilityEvent[]>(initialEvents);

    // 1. Estados para controlar explícitamente la navegación y la vista activa
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentView, setCurrentView] = useState<View>(Views.WEEK);

    // Estados para el formulario de entrada manual
    const [manualDate, setManualDate] = useState('');
    const [manualStart, setManualStart] = useState('18:00');
    const [manualEnd, setManualEnd] = useState('21:00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setEvents(initialEvents);
    }, [initialEvents]);

    // Lógica común para persistir franjas horarias
    const saveSlot = useCallback(async (start: Date, end: Date) => {
        const tempId = `temp-${Date.now()}`;
        const newEvent: AvailabilityEvent = {
            id: tempId,
            userId: currentUserId,
            title: currentUserName,
            start,
            end,
            color: currentUserColor,
        };

        setEvents((prev) => [...prev, newEvent]);

        const response = await addAvailability(currentUserId, groupId, start, end);

        if (response.success && response.id) {
            setEvents((prev) => prev.map(e => e.id === tempId ? { ...e, id: response.id! } : e));
        } else {
            alert('No se pudo guardar el horario.');
            setEvents((prev) => prev.filter(e => e.id !== tempId));
        }
    }, [currentUserId, groupId, currentUserColor, currentUserName]);

    // Manejo del arrastre del mouse (Desktop)
    const handleSelectSlot = useCallback(
        async (slotInfo: SlotInfo) => {
            if (slotInfo.action === 'select') {
                await saveSlot(slotInfo.start, slotInfo.end);
            }
        },
        [saveSlot]
    );

    // Manejo del formulario manual (Celular/Desktop)
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualDate || isSubmitting) return;

        setIsSubmitting(true);

        const [year, month, day] = manualDate.split('-').map(Number);
        const [startH, startM] = manualStart.split(':').map(Number);
        const [endH, endM] = manualEnd.split(':').map(Number);

        const startDate = new Date(year, month - 1, day, startH, startM);
        const endDate = new Date(year, month - 1, day, endH, endM);

        if (startDate >= endDate) {
            alert('La hora de fin debe ser posterior a la de inicio.');
            setIsSubmitting(false);
            return;
        }

        await saveSlot(startDate, endDate);
        setIsSubmitting(false);
    };

    // Manejo de eliminación al hacer clic sobre un bloque
    const handleSelectEvent = useCallback(async (event: AvailabilityEvent) => {
        if (event.userId !== currentUserId) {
            alert(`Este horario pertenece a ${event.title}. No puedes modificarlo.`);
            return;
        }

        const confirmDelete = window.confirm('¿Quieres eliminar este bloque de disponibilidad?');
        if (!confirmDelete) return;

        setEvents((prev) => prev.filter((e) => e.id !== event.id));

        const res = await deleteAvailability(event.id, groupId);
        if (!res.success) {
            alert('No se pudo eliminar el horario del servidor.');
            setEvents((prev) => [...prev, event]);
        }
    }, [currentUserId, groupId]);

    const eventPropGetter = useCallback(
        (event: AvailabilityEvent) => ({
            style: {
                backgroundColor: event.color,
                opacity: 0.6,
                mixBlendMode: 'multiply' as any,
                border: 'none',
                color: 'transparent',
                borderRadius: '4px',
                cursor: event.userId === currentUserId ? 'pointer' : 'default'
            },
        }),
        [currentUserId]
    );

    // 2. Funciones manejadoras que actualizan los estados de navegación
    const handleNavigate = useCallback((newDate: Date) => {
        setCurrentDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView: View) => {
        setCurrentView(newView);
    }, []);

    return (
        <div className="p-4 bg-white text-black grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Columna del Formulario Manual */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit space-y-4">
                <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <span>📅</span> Cargar Horario Manual
                </h2>
                <p className="text-xs text-slate-500">Ideal para celulares o franjas muy precisas.</p>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha</label>
                        <input
                            type="date"
                            required
                            value={manualDate}
                            onChange={(e) => setManualDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Desde</label>
                            <input
                                type="time"
                                required
                                value={manualStart}
                                onChange={(e) => setManualStart(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Hasta</label>
                            <input
                                type="time"
                                required
                                value={manualEnd}
                                onChange={(e) => setManualEnd(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Agregar Franja'}
                    </button>
                </form>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                    💡 <span className="font-medium text-slate-500">Tip:</span> Para borrar una franja tuya, simplemente hazle clic directo arriba en el calendario.
                </div>
            </div>

            {/* Columna del Calendario Visual */}
            <div className="lg:col-span-3 min-h-[550px] border rounded-xl shadow-sm p-4 bg-white overflow-x-auto">
                <div className="min-w-[600px] h-full">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        // 3. Conectamos las propiedades de estado y los manejadores al componente
                        date={currentDate}
                        view={currentView}
                        onNavigate={handleNavigate}
                        onView={handleViewChange}
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                        culture="es"
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventPropGetter}
                        step={30}
                        timeslots={2}
                    />
                </div>
            </div>

        </div>
    );
}