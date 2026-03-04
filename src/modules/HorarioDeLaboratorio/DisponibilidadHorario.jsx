import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft } from 'lucide-react';

// these constants must match those used in HorarioDeLaboratorio
const MIN_TIME = '07:00';
const MAX_TIME = '21:00';

function DisponibilidadHorario() {
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/horario-de-laboratorio"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al horario
        </Link>
        <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Disponibilidad por día</h1>
          <p className="text-sm text-gray-600 italic mb-4">
            Se consideran sólo horas entre {MIN_TIME} y {MAX_TIME}.
          </p>

          <div className="mb-4">
            <label className="mr-2 font-medium">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando disponibilidad…</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-500">No hay ocupaciones el {selectedDate}.</p>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Ocupaciones</h3>
                <ul className="list-disc list-inside">
                  {bookings.map((i) => (
                    <li key={i.id} className="py-1">
                      <span className="font-medium">
                        {i.content.hora_inicio}–{i.content.hora_fin}
                      </span>{' '}
                      <span className="text-sm text-gray-600">
                        ({i.content.laboratorio})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Horarios libres</h3>
                {computeFreeSlots(bookings).length === 0 ? (
                  <p className="text-gray-500">ninguno</p>
                ) : (
                  <ul className="list-disc list-inside">
                    {computeFreeSlots(bookings).map((slot, idx) => (
                      <li key={idx} className="py-1">
                        {slot.start}–{slot.end}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisponibilidadHorario;
