import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import DisponibilidadHorario from './DisponibilidadHorario';

const MIN_TIME = '07:00';
const MAX_TIME = '21:00';

const fields = [
  { name: 'laboratorio', label: 'Laboratorio', type: 'text', required: true },
  { name: 'dia', label: 'Fecha', type: 'date', required: true },
  { name: 'hora_inicio', label: 'Hora Inicio', type: 'time', required: true, min: MIN_TIME, max: MAX_TIME },
  { name: 'hora_fin', label: 'Hora Fin', type: 'time', required: true, min: MIN_TIME, max: MAX_TIME },
  { name: 'actividad', label: 'Actividad', type: 'text', required: true },
];

function HorarioDeLaboratorio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalForm, setShowModalForm] = useState(false); // Modal for Create/Edit
  const [showDispoModal, setShowDispoModal] = useState(false); // Modal for Availability
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', 'HorarioDeLaboratorio')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setErrorMsg('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validate = (data, editItem) => {
    if (data.hora_inicio && (data.hora_inicio < MIN_TIME || data.hora_inicio > MAX_TIME)) {
      return `La hora de inicio debe estar entre ${MIN_TIME} y ${MAX_TIME}.`;
    }
    if (data.hora_fin && (data.hora_fin < MIN_TIME || data.hora_fin > MAX_TIME)) {
      return `La hora de fin debe estar entre ${MIN_TIME} y ${MAX_TIME}.`;
    }
    if (data.hora_inicio && data.hora_fin && data.hora_inicio >= data.hora_fin) {
      return 'La hora de fin debe ser posterior a la hora de inicio.';
    }
    
    // Check overlaps
    const sameDay = items.filter(i => i.content.dia === data.dia && i.id !== editItem?.id);
    if (sameDay.length > 0) {
      for (let i of sameDay) {
        if (!(data.hora_fin <= i.content.hora_inicio || data.hora_inicio >= i.content.hora_fin)) {
          return 'El horario se solapa con otro registro existente en ese día.';
        }
      }
    }
    return null;
  };

  const addData = async (content) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('student_modules')
        .insert([{ module_owner: 'HorarioDeLaboratorio', content }])
        .select();

      if (error) throw error;
      setItems([data[0], ...items]);
      setSuccessMsg('¡Registro guardado correctamente!');
      resetForm();
    } catch (error) {
      console.error('Error adding data:', error.message);
      setErrorMsg('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateData = async (id, content) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('student_modules')
        .update({ content })
        .eq('id', id);

      if (error) throw error;
      setItems(items.map(item => item.id === id ? { ...item, content } : item));
      setSuccessMsg('¡Registro actualizado correctamente!');
      resetForm();
    } catch (error) {
      console.error('Error updating data:', error.message);
      setErrorMsg('Error al actualizar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteData = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) return;
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('student_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      setSuccessMsg('Registro eliminado.');
    } catch (error) {
      console.error('Error deleting data:', error.message);
      setErrorMsg('Error al eliminar: ' + error.message);
    }
  };

  const resetForm = () => {
    setShowModalForm(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate(formData, editingItem);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    
    if (editingItem) {
      updateData(editingItem.id, formData);
    } else {
      addData(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item.content);
    setShowModalForm(true);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const exportToCSV = () => {
    if (!items || items.length === 0) return;
    const headers = fields.map(f => f.label);
    const rows = items.map(i => fields.map(f => {
      const cell = i.content[f.name];
      return typeof cell === 'string' ? `"${cell.replace(/"/g,'""')}"` : cell;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HorarioLaboratorio.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dayColors = {
    Lunes: 'bg-red-100 text-red-800',
    Martes: 'bg-green-100 text-green-800',
    Miércoles: 'bg-yellow-100 text-yellow-800',
    Jueves: 'bg-blue-100 text-blue-800',
    Viernes: 'bg-indigo-100 text-indigo-800',
    Sábado: 'bg-purple-100 text-purple-800',
  };

  const isRLSError = errorMsg && (
    errorMsg.includes('row-level') ||
    errorMsg.includes('violates') ||
    errorMsg.includes('42501') ||
    errorMsg.includes('new row') ||
    errorMsg.includes('permission')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-800 font-sans selection:bg-blue-200">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link to="/" className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-3">
              <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
              Volver al panel principal
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-1">
              Horario de Laboratorio
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Gestiona y organiza los horarios de laboratorios y salones.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportToCSV}
              className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-4 py-2.5 rounded-xl flex items-center shadow-sm hover:shadow transition-all text-sm font-semibold"
            >
              <span className="mr-2 text-lg">📄</span> Exportar CSV
            </button>
            <button
              onClick={() => setShowDispoModal(true)}
              className="bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-sm font-semibold"
            >
              Ver disponibilidad
            </button>
            <button
              onClick={() => { setShowModalForm(true); setEditingItem(null); setErrorMsg(null); }}
              className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center shadow-md hover:shadow-xl transition-all font-semibold"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-transparent transition-colors"></div>
              <Plus className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Agregar Nuevo</span>
            </button>
          </div>
        </div>

        {/* Notificaciones globales */}
        {errorMsg && !showModalForm && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
            <div className="flex-1">
               <p className="font-semibold">Ocurrió un error</p>
               <p className="text-sm mt-1 font-mono bg-red-100 rounded p-1">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3 animate-bounce shadow">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {/* Lista de Registros */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 flex items-center">
              <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
              Registros Actuales
            </h2>
            <button 
              onClick={fetchData} 
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-12 text-gray-500">
               <svg className="animate-spin w-8 h-8 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
               </svg>
               Cargando datos...
             </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No hay datos aún. Haz clic en "Agregar Nuevo" para empezar.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                 const dia = item.content.dia;
                 const colorClass = dayColors[dia] || 'bg-gray-100 text-gray-800 ring-gray-200';
                 return (
                   <div 
                     key={item.id} 
                     className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                   >
                     {/* Decorative top gradient line */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     
                     <div className="flex justify-between items-start mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ring-1 ${colorClass.replace('bg-', 'bg-opacity-20 ring-').replace('text-', 'text-')}`}>
                          {dia}
                        </div>
                        <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                          <button onClick={() => handleEdit(item)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-full transition-colors shadow-sm" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteData(item.id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-full transition-colors shadow-sm" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Laboratorio</p>
                          <h3 className="text-xl font-bold text-gray-800 leading-tight">{item.content.laboratorio}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 border border-gray-100">
                             <p className="text-xs font-semibold text-gray-500 mb-0.5">Horario</p>
                             <p className="font-mono text-sm font-bold text-gray-700">{item.content.hora_inicio} - {item.content.hora_fin}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Actividad</p>
                          <p className="text-sm font-medium text-gray-600 line-clamp-2">{item.content.actividad}</p>
                        </div>
                     </div>
                     
                     <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Creado</span>
                       <span className="text-xs font-medium text-gray-400">
                         {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </span>
                     </div>
                   </div>
                 )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Agregar / Editar */}
      {showModalForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.15)] p-6 md:p-10 w-full max-w-lg relative animate-[fadeIn_0.3s_ease-out]">
            <button 
              onClick={resetForm} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-200 p-2.5 rounded-full transition-all hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black text-gray-800 mb-2">
              {editingItem ? 'Editar Registro' : 'Nuevo Registro'}
            </h2>
            <p className="text-gray-500 font-medium mb-8">
              {editingItem ? 'Modifica los datos del registro seleccionado.' : 'Completa los datos para agendar el laboratorio.'}
            </p>

            {errorMsg && (
              <div className="mb-8 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-red-800">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map((field) => (
                <div key={field.name} className="relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                    {field.label} {field.required && <span className="text-blue-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all hover:bg-gray-100/50"
                    required={field.required}
                    {...(field.min ? { min: field.min } : {})}
                    {...(field.max ? { max: field.max } : {})}
                  />
                </div>
              ))}
              <div className="pt-6 mt-6 border-t border-gray-100 flex gap-4 flex-row-reverse">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingItem ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-6 py-4 rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Disponibilidad */}
      {showDispoModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-transparent w-full max-w-4xl max-h-[95vh] relative animate-[scaleIn_0.3s_ease-out]">
            <button
              onClick={() => setShowDispoModal(false)}
              className="absolute top-2 right-2 md:-right-12 md:-top-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur p-3 rounded-full transition-all z-[60] hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="overflow-y-auto max-h-[90vh] rounded-[2rem] shadow-[0_0_60px_rgba(0,0,0,0.3)] bg-white/50 ring-1 ring-white/20">
              <DisponibilidadHorario onClose={() => setShowDispoModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HorarioDeLaboratorio;
