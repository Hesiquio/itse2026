import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const horas = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`); // 8:00 a 19:00

const getAsistenciaColor = (asistencia) => {
  switch (asistencia) {
    case 'Asistió':
      return 'bg-green-100 border-green-400';
    case 'Falta':
      return 'bg-red-100 border-red-400';
    case 'Retardo':
      return 'bg-yellow-100 border-yellow-400';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getAsistenciaIcon = (asistencia) => {
  switch (asistencia) {
    case 'Asistió':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'Falta':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'Retardo':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    default:
      return null;
  }
};

export default function HorarioVistaSemanal() {
  const [horario, setHorario] = useState([]);

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Horario Semanal</h2>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
            <th className="px-4 py-3 text-white font-semibold text-left rounded-tl-lg">Hora</th>
            {diasSemana.map((dia, idx) => (
              <th
                key={dia}
                className={`px-4 py-3 text-white font-semibold text-center ${
                  idx === diasSemana.length - 1 ? 'rounded-tr-lg' : ''
                }`}
              >
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map((hora, hourIdx) => (
            <tr key={hora} className={hourIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-4 py-3 font-semibold text-gray-800 border-r border-gray-200">{hora}</td>
              {diasSemana.map(dia => {
                const actividad = horario.find(h => h.content.dia === dia && h.content.hora === hora);
                return (
                  <td key={dia} className="px-4 py-3 text-center border-r border-gray-200 last:border-r-0">
                    {actividad ? (
                      <div
                        className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                          getAsistenciaColor(actividad.content.asistencia)
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="font-bold text-sm text-gray-800">{actividad.content.materia}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs font-medium">
                          {getAsistenciaIcon(actividad.content.asistencia)}
                          <span>{actividad.content.asistencia || 'Sin marcar'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-300 text-sm">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
