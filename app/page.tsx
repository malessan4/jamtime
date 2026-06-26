// app/page.tsx

import CalendarClient from './components/CalendarClient';

// Simulamos datos de la base de datos para probar la interfaz visual
const mockEvents = [
  {
    id: '1',
    title: 'Mi Disponibilidad (Guitarra)',
    start: new Date(2026, 5, 26, 18, 0, 0), // 26 de Junio, 18:00 hs
    end: new Date(2026, 5, 26, 21, 0, 0),   // 26 de Junio, 21:00 hs
    color: '#3b82f6', // Azul
  },
  {
    id: '2',
    title: 'Mi Disponibilidad (Bajo)',
    start: new Date(2026, 5, 26, 19, 30, 0), // 26 de Junio, 19:30 hs
    end: new Date(2026, 5, 26, 22, 0, 0),   // 26 de Junio, 22:00 hs
    color: '#ef4444', // Rojo
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <CalendarClient
          initialEvents={mockEvents}
          currentUserId="user-1"
          groupId="group-1"
        />
      </div>
    </main>
  );
}