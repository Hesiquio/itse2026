

import ModuleTemplate from '../../components/ModuleTemplate';
import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import HorarioVistaSemanal from './HorarioVistaSemanal';
import HorarioVistaMensual from './HorarioVistaMensual';
import { Calendar, Clock } from 'lucide-react';

const scheduleFields = [
  { name: 'materia', label: 'Materia/Actividad', type: 'text', required: true },
  { name: 'dia', label: 'Día', type: 'text', required: true },
  { name: 'hora', label: 'Hora', type: 'time', required: true },
  { name: 'asistencia', label: 'Asistencia', type: 'select', options: ['Asistió', 'Falta', 'Retardo'], required: false },
];

function ControlDeAsistencias() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [viewType, setViewType] = useState(''); // '' | 'semana' | 'mes'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Control de Asistencias</h1>
          <p className="text-gray-600">Planifica tu horario y registra tu asistencia</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              showSchedule
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <Clock className="w-5 h-5" />
            {showSchedule ? 'Ocultar Horario' : 'Planificar Horario'}
          </button>
          {showSchedule && (
            <div className="mt-6">
              <ModuleTemplate
                moduleName="Horario Flexible"
                moduleOwner="ControlDeAsistencias_schedule"
                fields={scheduleFields}
              />
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Vistas</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setViewType(viewType === 'semana' ? '' : 'semana')}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                viewType === 'semana'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <Clock className="w-5 h-5" />
              Vista Semanal
            </button>
            <button
              onClick={() => setViewType(viewType === 'mes' ? '' : 'mes')}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                viewType === 'mes'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400 hover:shadow-md'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Vista Mensual
            </button>
          </div>
        </div>

        <div className="mt-8">
          {viewType === 'semana' && <HorarioVistaSemanal />}
          {viewType === 'mes' && <HorarioVistaMensual />}
        </div>
      </div>
    </div>
  );
}

export default ControlDeAsistencias;
