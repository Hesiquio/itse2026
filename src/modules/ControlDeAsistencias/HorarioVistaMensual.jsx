import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const daysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const getAsistenciaColor = (asistencia) => {
  switch (asistencia) {
    case 'Asistió':
      return 'bg-green-50 border-green-300';
    case 'Falta':
      return 'bg-red-50 border-red-300';
    case 'Retardo':
      return 'bg-yellow-50 border-yellow-300';
    default:
      return 'bg-gray-50';
  }
};

const getAsistenciaIcon = (asistencia) => {
  switch (asistencia) {
    case 'Asistió':
      return <CheckCircle className="w-3 h-3 text-green-600" />;
    case 'Falta':
      return <XCircle className="w-3 h-3 text-red-600" />;
    case 'Retardo':
      return <Clock className="w-3 h-3 text-yellow-600" />;
    default:
      return null;
  }
};

export default function HorarioVistaMensual() {
  const [horario, setHorario] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    async function fetchHorario() {
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', 'ControlDeAsistencias_schedule');
      if (!error) setHorario(data || []);
    }
    fetchHorario();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {daysShort.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfWeek)].map((_, i) => (
          <div key={`empty-${i}`} className="h-24"></div>
        ))}
        {[...Array(days)].map((_, i) => {
          const day = i + 1;
          const actividades = horario.filter(h => {
            const fecha = h.content.dia || '';
            return fecha === day.toString() || fecha.includes(`-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
          });
          return (
            <div
              key={day}
              className={`min-h-24 p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                actividades.length > 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-800 mb-2">{day}</div>
              {actividades.length > 0 ? (
                <div className="space-y-1">
                  {actividades.map(act => (
                    <div
                      key={act.id}
                      className={`text-xs p-1 rounded border-l-3 ${
                        getAsistenciaColor(act.content.asistencia)
                      }`}
                    >
                      <div className="font-semibold text-gray-800 line-clamp-1">
                        {act.content.materia}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {getAsistenciaIcon(act.content.asistencia)}
                        <span className="text-gray-600">
                          {act.content.asistencia || 'Sin marcar'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-300 text-xs">-</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
