// app/components/CalendarClient.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { addAvailability } from '../actions';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// 1. Configuración del idioma y formato de fechas
const locales = { es };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // La semana empieza el lunes
    getDay,
    locales,
});

interface AvailabilityEvent {
    id?: string;
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

    // Sincroniza el estado local cuando el servidor revalida y envía datos nuevos
    useEffect(() => {
        setEvents(initialEvents);
    }, [initialEvents]);

    const handleSelectSlot = useCallback(
        async (slotInfo: SlotInfo) => {
            if (slotInfo.action === 'select') {
                const newEvent: AvailabilityEvent = {
                    title: currentUserName,
                    start: slotInfo.start,
                    end: slotInfo.end,
                    color: currentUserColor,
                };

                // UI Optimista: Pintamos en pantalla de inmediato
                setEvents((prev) => [...prev, newEvent]);

                // Guardado real en Supabase mediante Server Action
                const response = await addAvailability(currentUserId, groupId, slotInfo.start, slotInfo.end);

                if (!response.success) {
                    alert('No se pudo guardar el horario. Intenta de nuevo.');
                    // Si falla, removemos el último evento optimista
                    setEvents((prev) => prev.slice(0, -1));
                }
            }
        },
        [currentUserId, groupId, currentUserColor, currentUserName]
    );

    const eventPropGetter = useCallback(
        (event: AvailabilityEvent) => ({
            style: {
                backgroundColor: event.color,
                opacity: 0.6,
                mixBlendMode: 'multiply' as any,
                border: 'none',
                color: 'transparent',
                borderRadius: '4px',
            },
        }),
        []
    );

    return (
        <div className="h-screen p-4 bg-white text-black flex flex-col">
            <div className="flex-1 min-h-[600px] border rounded-lg shadow-sm p-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    culture="es"
                    selectable
                    onSelectSlot={handleSelectSlot}
                    eventPropGetter={eventPropGetter}
                    step={30}
                    timeslots={2}
                />
            </div>
        </div>
    );
}