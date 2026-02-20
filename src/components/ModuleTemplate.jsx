import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

function ModuleTemplate({ moduleName, moduleOwner, fields }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Estado para mostrar errores y mensajes de éxito en pantalla
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Oculta el mensaje de éxito tras 3 segundos
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
        .eq('module_owner', moduleOwner)
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
        .insert([{ module_owner: moduleOwner, content }])
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

  // Detecta si el error es de RLS / permisos
  const isRLSError = errorMsg && (
    errorMsg.includes('row-level') ||
    errorMsg.includes('violates') ||
    errorMsg.includes('42501') ||
    errorMsg.includes('new row') ||
    errorMsg.includes('permission')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">{moduleName}</h1>
            <button
              onClick={() => { setShowForm(!showForm); setEditingItem(null); setErrorMsg(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showForm ? 'Cancelar' : 'Agregar Nuevo'}
            </button>
          </div>
        </div>

        {/* ── Banner de error ── */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-semibold">Ocurrió un error</p>
                <p className="text-sm mt-1 font-mono bg-red-100 rounded p-1">{errorMsg}</p>
                {isRLSError && (
                  <div className="mt-3 text-sm bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-900">
                    <p className="font-semibold mb-1">💡 Solución — Row Level Security (RLS):</p>
                    <p>La tabla tiene RLS activado y bloquea operaciones sin autenticación. Ejecuta este SQL en tu panel de Supabase:</p>
                    <pre className="mt-2 bg-gray-800 text-green-300 text-xs rounded p-2 overflow-x-auto">
                      {`-- Supabase → SQL Editor → New Query
ALTER TABLE student_modules DISABLE ROW LEVEL SECURITY;`}
                    </pre>
                  </div>
                )}
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Banner de éxito ── */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* ── Formulario ── */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              {editingItem ? 'Editar' : 'Agregar Nuevo'} {moduleName}
            </h2>
            <form onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.name} className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Lista ── */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Lista de {moduleName}</h2>
            <button
              onClick={fetchData}
              className="text-sm text-blue-600 hover:underline"
            >
              ↻ Recargar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Cargando datos...
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay datos aún. Haz clic en "Agregar Nuevo" para empezar.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {fields.map((field) => (
                        <div key={field.name} className="mb-2">
                          <span className="font-medium text-gray-700">{field.label}: </span>
                          <span className="text-gray-600">
                            {item.content[field.name] || 'N/A'}
                          </span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-400 mt-2">
                        Creado: {new Date(item.created_at).toLocaleString('es-ES')}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteData(item.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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

export default ModuleTemplate;
