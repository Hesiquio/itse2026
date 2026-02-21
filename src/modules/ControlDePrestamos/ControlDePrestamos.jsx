import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, BookOpen } from 'lucide-react';

const MODULE_OWNER = 'ControlDePrestamos';

function ControlDePrestamos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    articulo: '',
    persona: '',
    fecha_prestamo: '',
    fecha_devolucion: '',
    estado: 'Prestado',
  });

  useEffect(() => {
    fetchData();
  }, []);

  // ── CRUD ──────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', MODULE_OWNER)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addData = async (content) => {
    try {
      const { data, error } = await supabase
        .from('student_modules')
        .insert([{ module_owner: MODULE_OWNER, content }])
        .select();

      if (error) throw error;
      setItems([data[0], ...items]);
      resetForm();
    } catch (error) {
      console.error('Error adding data:', error.message);
    }
  };

  const updateData = async (id, content) => {
    try {
      const { error } = await supabase
        .from('student_modules')
        .update({ content })
        .eq('id', id);

      if (error) throw error;
      setItems(items.map((item) => (item.id === id ? { ...item, content } : item)));
      resetForm();
    } catch (error) {
      console.error('Error updating data:', error.message);
    }
  };

  const deleteData = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este préstamo?')) return;

    try {
      const { error } = await supabase
        .from('student_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting data:', error.message);
    }
  };

  // ── Form helpers ──────────────────────────────────────

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      articulo: '',
      persona: '',
      fecha_prestamo: '',
      fecha_devolucion: '',
      estado: 'Prestado',
    });
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Helpers de estado visual ──────────────────────────

  const estadoBadge = (estado) => {
    const isPrestado = estado === 'Prestado';
    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isPrestado
            ? 'bg-amber-100 text-amber-800'
            : 'bg-green-100 text-green-800'
          }`}
      >
        {estado}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-800">
                Control de Préstamos
              </h1>
            </div>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              {showForm ? (
                <X className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {showForm ? 'Cancelar' : 'Nuevo Préstamo'}
            </button>
          </div>
        </div>

        {/* ── Formulario ─────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              {editingItem ? 'Editar Préstamo' : 'Registrar Préstamo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Artículo */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Artículo
                  </label>
                  <input
                    type="text"
                    name="articulo"
                    value={formData.articulo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Persona */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Persona
                  </label>
                  <input
                    type="text"
                    name="persona"
                    value={formData.persona}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Fecha de Préstamo */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Fecha de Préstamo
                  </label>
                  <input
                    type="date"
                    name="fecha_prestamo"
                    value={formData.fecha_prestamo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Fecha de Devolución */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Fecha de Devolución
                  </label>
                  <input
                    type="date"
                    name="fecha_devolucion"
                    value={formData.fecha_devolucion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Prestado">Prestado</option>
                    <option value="Devuelto">Devuelto</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Lista de préstamos ──────────────────────── */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Lista de Préstamos</h2>

          {loading ? (
            <p className="text-gray-500">Cargando datos...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">
              No hay préstamos registrados. Agrega el primero.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      <div>
                        <span className="font-medium text-gray-700">Artículo: </span>
                        <span className="text-gray-600">
                          {item.content?.articulo || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Persona: </span>
                        <span className="text-gray-600">
                          {item.content?.persona || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Préstamo: </span>
                        <span className="text-gray-600">
                          {item.content?.fecha_prestamo || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Devolución: </span>
                        <span className="text-gray-600">
                          {item.content?.fecha_devolucion || '—'}
                        </span>
                      </div>
                      <div className="md:col-span-2 mt-1">
                        {estadoBadge(item.content?.estado || 'Prestado')}
                      </div>
                      <div className="md:col-span-2 text-xs text-gray-400 mt-2">
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

export default ControlDePrestamos;
