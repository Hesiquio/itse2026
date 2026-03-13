import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ArrowLeft } from 'lucide-react';

// these constants must match those used in HorarioDeLaboratorio
const MIN_TIME = '07:00';
const MAX_TIME = '21:00';

function DisponibilidadHorario({ onClose }) {
  const [items, setItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', 'HorarioDeLaboratorio')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching disponibilidad:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const computeFreeSlots = (bookings) => {
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const fromMinutes = (m) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };
    if (!bookings.length) {
      return [{ start: MIN_TIME, end: MAX_TIME }];
    }
    const dayStart = toMinutes(MIN_TIME);
    const dayEnd = toMinutes(MAX_TIME);
    const sorted = [...bookings]
      .map((b) => ({
        inicio: Math.max(toMinutes(b.content.hora_inicio), dayStart),
        fin: Math.min(toMinutes(b.content.hora_fin), dayEnd),
      }))
      .filter((b) => b.fin > b.inicio)
      .sort((a, b) => a.inicio - b.inicio);
    const free = [];
    let prevEnd = dayStart;
    sorted.forEach((b) => {
      if (b.inicio > prevEnd) {
        free.push({ start: fromMinutes(prevEnd), end: fromMinutes(b.inicio) });
      }
      prevEnd = Math.max(prevEnd, b.fin);
    });
    if (prevEnd < dayEnd) {
      free.push({ start: fromMinutes(prevEnd), end: fromMinutes(dayEnd) });
    }
    return free;
  };

  const bookings = items.filter((i) => i.content.dia === selectedDate);

  return (
    <div className="w-full bg-white sm:rounded-[2rem] overflow-hidden">
      <div className="p-6 md:p-10 w-full relative">
        <h2 className="text-3xl font-black text-gray-800 mb-2 border-none">
          Disponibilidad por día
        </h2>
        <p className="text-gray-500 font-medium mb-8">
          Vista rápida de los horarios libres y ocupados entre las {MIN_TIME} y {MAX_TIME} hrs.
        </p>

        <div className="mb-8 p-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
            Selecciona una Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all hover:bg-gray-100/50"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 text-indigo-500">
            <svg className="animate-spin w-8 h-8 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="font-semibold text-gray-500">Analizando horarios...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Día Libre</h3>
            <p className="text-gray-500 font-medium">No hay ocupaciones registradas para el {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Ocupaciones */}
            <div className="flex-1 bg-gradient-to-b from-red-50 to-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-400"></div>
              <h3 className="font-bold text-red-900 mb-4 flex items-center text-lg">
                <span className="flex w-6 h-6 rounded-full bg-red-100 text-red-500 items-center justify-center mr-2 shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </span>
                Ocupado
              </h3>
              <ul className="space-y-3">
                {bookings.map((i) => (
                  <li key={i.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-red-100/50 hover:border-red-200 transition-colors">
                    <span className="font-extrabold text-gray-800 block mb-1">
                      {i.content.hora_inicio} – {i.content.hora_fin}
                    </span>
                    <div className="flex flex-wrap items-center mt-2 gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
                        {i.content.laboratorio}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Libres */}
            <div className="flex-1 bg-gradient-to-b from-green-50 to-white p-5 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-400"></div>
              <h3 className="font-bold text-green-900 mb-4 flex items-center text-lg">
                 <span className="flex w-6 h-6 rounded-full bg-green-100 text-green-500 items-center justify-center mr-2 shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </span>
                Disponible
              </h3>
              {computeFreeSlots(bookings).length === 0 ? (
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center text-gray-400 font-medium italic">
                  Sin horarios libres en este rango
                </div>
              ) : (
                <ul className="space-y-3">
                  {computeFreeSlots(bookings).map((slot, idx) => (
                    <li key={idx} className="bg-white p-3.5 rounded-xl shadow-sm border border-green-100 hover:border-green-300 transition-all font-black text-gray-700 text-center tracking-wide">
                      {slot.start} – {slot.end}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DisponibilidadHorario;
