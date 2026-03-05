

import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import HorarioVistaSemanal from './HorarioVistaSemanal';
import HorarioVistaMensual from './HorarioVistaMensual';
import DashboardEstadisticas from './DashboardEstadisticas';
import { Calendar, Clock, Plus, X, Save, BarChart3 } from 'lucide-react';

function ControlDeAsistencias() {
  const [showForm, setShowForm] = useState(false);
  const [viewType, setViewType] = useState(''); // '' | 'semana' | 'mes' | 'dashboard'
  const [formData, setFormData] = useState({
    materia: '',
    dia: '',
    hora_inicio: '',
    hora_fin: '',
    asistencia: 'No registrada'
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('student_modules')
        .insert([{ module_owner: 'ControlDeAsistencias_schedule', content: formData }])
        .select();

      if (error) throw error;
      setFormData({ materia: '', dia: '', hora_inicio: '', hora_fin: '', asistencia: 'No registrada' });
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Control de Asistencias</h1>
          <p className="text-gray-600">Planifica tu horario y registra tu asistencia</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              showForm
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancelar' : 'Agregar Horario'}
          </button>

          {showForm && (
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agregar nuevo horario</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Materia/Actividad</label>
                  <input
                    type="text"
                    value={formData.materia}
                    onChange={(e) => handleInputChange('materia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Día</label>
                  <select
                    value={formData.dia}
                    onChange={(e) => handleInputChange('dia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                      <option key={dia} value={dia}>{dia}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Hora Inicio</label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Hora Fin</label>
                    <input
                      type="time"
                      value={formData.hora_fin}
                      onChange={(e) => handleInputChange('hora_fin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Asistencia</label>
                  <select
                    value={formData.asistencia}
                    onChange={(e) => handleInputChange('asistencia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="No registrada">No registrada</option>
                    <option value="Asistió">Asistió</option>
                    <option value="Falta">Falta</option>
                    <option value="Retardo">Retardo</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
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
            <button
              onClick={() => setViewType(viewType === 'dashboard' ? '' : 'dashboard')}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                viewType === 'dashboard'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:shadow-md'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Estadísticas
            </button>
          </div>
        </div>

        <div className="mt-8">
          {viewType === 'semana' && <HorarioVistaSemanal />}
          {viewType === 'mes' && <HorarioVistaMensual />}
          {viewType === 'dashboard' && <DashboardEstadisticas />}
        </div>
      </div>
    </div>
  );
}

export default ControlDeAsistencias;
