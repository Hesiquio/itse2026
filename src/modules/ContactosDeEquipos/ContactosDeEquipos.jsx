import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

const fields = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'equipo', label: 'Equipo', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
  { name: 'rol', label: 'Rol', type: 'text', required: false },
];

function ContactosDeEquipos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
        .eq('module_owner', 'ContactosDeEquipos')
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

  const addData = async (content) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('student_modules')
        .insert([{ module_owner: 'ContactosDeEquipos', content }])
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
    if (!confirm('¿Estás seguro de que deseas eliminar este elemento?')) return;
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
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateData(editingItem.id, formData);
    } else {
      addData(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item.content);
    setShowForm(true);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const groupItemsByDate = (items) => {
    const grouped = {};
    items.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    });
    return grouped;
  };

  const isRLSError = errorMsg && (
    errorMsg.includes('row-level') ||
    errorMsg.includes('violates') ||
    errorMsg.includes('42501') ||
    errorMsg.includes('new row') ||
    errorMsg.includes('permission')
  );

  // Generar estrellas cayendo
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: Math.random() * 3 + 4,
    size: Math.random() * 2 + 1,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-teal-900 relative overflow-hidden">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes moonGlow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(255, 255, 200, 0.8), 
                        0 0 60px rgba(255, 255, 100, 0.5),
                        inset -30px -30px 60px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 50px rgba(255, 255, 200, 1), 
                        0 0 80px rgba(255, 255, 100, 0.7),
                        inset -30px -30px 60px rgba(0, 0, 0, 0.3);
          }
        }
        .falling-star {
          animation: fall linear infinite;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 6px rgba(255,255,255,0.8);
        }
        .twinkle-star {
          animation: twinkle 3s ease-in-out infinite;
        }
        .moon {
          animation: moonGlow 4s ease-in-out infinite;
          background: radial-gradient(ellipse at 35% 35%, rgba(255, 255, 200, 1), rgba(255, 250, 150, 0.9) 20%, rgba(200, 200, 100, 0.8));
        }
        @keyframes comet {
          0% { transform: translate(-100px, -100px) rotate(45deg); opacity: 0; }
          15% { opacity: 0.6; }
          100% { transform: translate(110vw, 110vh) rotate(45deg); opacity: 0; }
        }
        .comet {
          position: absolute;
          top: -30px;
          left: -30px;
          width: 120px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0));
          box-shadow: 0 0 4px 1px rgba(255,255,255,0.5);
          animation: comet 8s linear infinite;
          opacity: 0.7;
        }
      `}</style>

      {/* Luna Brillante */}
      <div className="absolute top-20 right-20 w-32 h-32 moon rounded-full pointer-events-none" />

      {/* Cometa */}
      <div className="comet" />

      {/* Estrellas cayendo continuamente */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="falling-star absolute"
          style={{
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Estrellas fijas parpadeantes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={`static-${i}`}
            className="twinkle-star absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 80}%`,
              opacity: 0.5,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </Link>

          {/* Imagen de Contactos */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://media.giphy.com/media/l0MYt5kMPEjXz0XO0/giphy.gif" 
              alt="Contact decoration" 
              className="w-40 h-40 rounded-2xl shadow-2xl"
            />
          </div>

          {/* Título LUNA Centrado */}
          <div className="text-center mb-8">

            <p className="text-gray-600 text-2xl font-bold">Contactos de Equipos</p>
          </div>

          {/* Botón Agregar Nuevo */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => { setShowForm(!showForm); setEditingItem(null); setErrorMsg(null); }}
              className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 hover:from-blue-700 hover:via-cyan-700 hover:to-green-700 text-white px-8 py-4 rounded-full flex items-center transition-all transform hover:scale-110 hover:shadow-2xl font-bold text-lg shadow-xl"
            >
              {showForm ? <X className="w-6 h-6 mr-3" /> : <Plus className="w-6 h-6 mr-3" />}
              {showForm ? 'Cancelar' : '✨ Agregar Nuevo Contacto'}
            </button>
          </div>
        </div>

        {/* Mensajes de error */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl px-6 py-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-bold text-lg">⚠️ Error</p>
                <p className="text-sm mt-1">{errorMsg}</p>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mensajes de éxito */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border-2 border-green-300 text-green-800 rounded-xl px-6 py-4 shadow-lg font-semibold">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-green-600 rounded-2xl shadow-2xl p-8 mb-8 border-2 border-blue-300">
            <h2 className="text-3xl font-bold mb-6 text-white flex items-center">
              {editingItem ? '✏️ Editar Contacto' : '🆕 Agregar Nuevo Contacto'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {fields.map((field) => (
                  <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-white font-bold mb-2 text-sm uppercase tracking-wider">
                      {field.label}
                      {field.required && <span className="text-yellow-300 ml-2 text-xl">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white text-gray-800 font-semibold placeholder-gray-400"
                        rows="4"
                        required={field.required}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white text-gray-800 font-semibold"
                        required={field.required}
                      >
                        <option value="">Seleccionar...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white text-gray-800 font-semibold placeholder-gray-400"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-green-300 disabled:to-emerald-400 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg uppercase tracking-wider"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Guardar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg uppercase tracking-wider"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de contactos */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              📋 Contactos
            </h2>
            <button
              onClick={fetchData}
              className="text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-bold"
            >
              ↻ Recargar
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <svg className="animate-spin w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-lg font-semibold text-gray-600">Cargando contactos...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">👥</span>
              <p className="text-gray-500 text-lg">No hay contactos aún. ¡Haz clic en "✨ Agregar Nuevo Contacto" para empezar!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupItemsByDate(items)).map(([date, dateItems]) => (
                <div key={date} className="mb-8">
                  {/* Encabezado de fecha */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3 rounded-full shadow-lg">
                      📅 {date}
                    </span>
                    <span className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-2 rounded-full shadow-lg">
                      {dateItems.length} {dateItems.length === 1 ? 'contacto' : 'contactos'}
                    </span>
                  </div>

                  {/* Tarjetas de contactos */}
                  <div className="space-y-4">
                    {dateItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-600 rounded-xl p-6 hover:shadow-xl transition-all transform hover:scale-102 border-t-2 border-r-2 border-b-2 border-blue-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Badge con número */}
                            <div className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                              #{idx + 1}
                            </div>

                            {/* Información del contacto */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {fields.map((field) => (
                                <div key={field.name} className="flex flex-col">
                                  <span className="font-bold text-sm text-blue-700 uppercase tracking-wider">{field.label}</span>
                                  <span className="text-gray-800 font-semibold text-base mt-1">
                                    {field.name === 'email' ? (
                                      <a href={`mailto:${item.content[field.name]}`} className="text-blue-600 hover:text-blue-800 underline">
                                        {item.content[field.name] || '—'}
                                      </a>
                                    ) : field.name === 'telefono' ? (
                                      <a href={`tel:${item.content[field.name]}`} className="text-blue-600 hover:text-blue-800 underline">
                                        {item.content[field.name] || '—'}
                                      </a>
                                    ) : (
                                      item.content[field.name] || '—'
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Metadata */}
                            <div className="text-xs text-gray-500 pt-4 border-t border-gray-300 flex gap-4">
                              <span>⏰ {new Date(item.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>📍 ID: {item.id.toString().slice(0, 8)}</span>
                            </div>
                          </div>

                          {/* Botones de acción */}
                          <div className="flex gap-3 ml-6">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 p-3 rounded-lg transition-all transform hover:scale-110 shadow-lg font-bold"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteData(item.id)}
                              className="text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 p-3 rounded-lg transition-all transform hover:scale-110 shadow-lg font-bold"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactosDeEquipos;
