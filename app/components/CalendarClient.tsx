// app/components/CalendarClient.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 1. Configuración del idioma y formato de fechas
const locales = {
    es: es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // La semana empieza el lunes
    getDay,
    locales,
});

// 2. Definición de Tipos
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
    groupId: string;
}

export default function CalendarClient({ initialEvents, currentUserId, groupId }: CalendarClientProps) {
    const [events, setEvents] = useState<AvailabilityEvent[]>(initialEvents);

    // 3. Manejador para cuando un usuario selecciona una franja libre
    const handleSelectSlot = useCallback(
        async (slotInfo: SlotInfo) => {
            // Validamos que sea una selección de horas y no un día entero
            if (slotInfo.action === 'select') {
                const newEvent: AvailabilityEvent = {
                    title: 'Mi Disponibilidad',
                    start: slotInfo.start,
                    end: slotInfo.end,
                    color: '#FF5733', // Aquí iría el color del usuario actual
                };

                // Actualizamos la UI inmediatamente (Optimistic UI)
                setEvents((prev) => [...prev, newEvent]);

                // TODO: Aquí llamaremos al Server Action addAvailability(userId, groupId, start, end)
                // const response = await addAvailability(currentUserId, groupId, slotInfo.start, slotInfo.end);
                // if (!response.success) { revertir estado... }
            }
        },
        [currentUserId, groupId]
    );

    // 4. Personalización visual de los eventos
    const eventPropGetter = useCallback(
        (event: AvailabilityEvent) => {
            return {
                style: {
                    backgroundColor: event.color,
                    opacity: 0.6,
                    // Este es el truco clave: hace que los colores superpuestos se oscurezcan
                    mixBlendMode: 'multiply' as any,
                    border: 'none',
                    color: 'transparent', // Ocultamos el texto para priorizar el mapa de calor visual
                    borderRadius: '4px',
                },
            };
        },
        []
    );

    return (
        <div className="h-screen p-4 bg-white text-black flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center">Calendario de Ensayos</h2>

            <div className="flex-1 min-h-[600px] border rounded-lg shadow-sm p-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK} // Mostramos la vista semanal por defecto
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    culture="es"
                    selectable // Permite arrastrar el mouse para seleccionar franjas
                    onSelectSlot={handleSelectSlot}
                    eventPropGetter={eventPropGetter}
                    step={30} // Intervalos de 30 minutos
                    timeslots={2} // Dos bloques por hora
                    min={new Date(2020, 1, 1, 6, 0, 0)} // Empieza a las 6:00 AM
                    max={new Date(2020, 1, 1, 23, 59, 0)} // Termina a las 11:59 PM
                />
            </div>
        </div>
    );
}