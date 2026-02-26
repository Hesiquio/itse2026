import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './ControlDePrestamos.css';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
  User,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  Check
} from 'lucide-react';

const MODULE_OWNER = 'ControlDePrestamos';
const INITIAL_FORM_STATE = {
  articulo: '',
  persona: '',
  fecha_prestamo: new Date().toISOString().split('T')[0],
  fecha_devolucion: '',
  estado: 'Prestado',
};

function ControlDePrestamos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null });

  const showNotification = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const closeConfirm = () => setConfirmDialog({ show: false, id: null });

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
      showNotification('¡Registro agregado correctamente!');
    } catch (error) {
      console.error('Error adding data:', error.message);
      showNotification('Error al agregar el registro', 'error');
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
      showNotification('Registro actualizado con éxito');
    } catch (error) {
      console.error('Error updating data:', error.message);
      showNotification('Error al actualizar el registro', 'error');
    }
  };

  const deleteData = async (id) => {
    try {
      const { error } = await supabase
        .from('student_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(items.filter((item) => item.id !== id));
      showNotification('Registro eliminado del sistema', 'success');
      closeConfirm();
    } catch (error) {
      console.error('Error deleting data:', error.message);
      showNotification('Error al eliminar el registro', 'error');
    }
  };

  const toggleStatus = useCallback(async (item) => {
    const content = item.content || {};
    const newStatus = content.estado === 'Prestado' ? 'Devuelto' : 'Prestado';
    const newContent = { ...content, estado: newStatus };

    // Si se marca como devuelto hoy, actualizamos la fecha de devolución automáticamente
    if (newStatus === 'Devuelto') {
      newContent.fecha_devolucion = new Date().toISOString().split('T')[0];
    }

    try {
      const { error } = await supabase
        .from('student_modules')
        .update({ content: newContent })
        .eq('id', item.id);

      if (error) throw error;
      setItems(prevItems => prevItems.map((i) => (i.id === item.id ? { ...i, content: newContent } : i)));
      showNotification(`Estado actualizado a: ${newStatus}`);
    } catch (error) {
      console.error('Error toggling status:', error.message);
      showNotification('Error al cambiar el estado', 'error');
    }
  }, [showNotification]);

  // ── Form helpers ──────────────────────────────────────

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM_STATE);
  }, []);

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
    setFormData(item.content || INITIAL_FORM_STATE);
    setShowForm(true);
  };

  const handleChange = (e) => {
    let value = e.target.value;

    // Capitalización para campos de texto
    if (e.target.name === 'articulo' || e.target.name === 'persona') {
      value = value.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Validación de fechas
    if (e.target.name === 'fecha_devolucion' && value < formData.fecha_prestamo && value !== '') {
      showNotification('La fecha de devolución no puede ser anterior al préstamo', 'error');
      return;
    }

    setFormData({ ...formData, [e.target.name]: value });
  };

  // ── Modal Scroll Lock ──────────────────────────────────
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  // ── Helpers de UI ──────────────────────────────
  const filteredItems = useMemo(() =>
    items.filter(item => {
      const matchesSearch =
        item.content?.articulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.persona?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'Todos' || item.content?.estado === statusFilter;

      return matchesSearch && matchesStatus;
    }), [items, searchTerm, statusFilter]
  );

  const stats = useMemo(() => [
    {
      label: 'Total Préstamos',
      value: items.length,
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      borderColor: 'border-blue-500',
    },
    {
      label: 'Préstamos Activos',
      value: items.filter(i => i.content?.estado === 'Prestado').length,
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      borderColor: 'border-amber-500',
    },
    {
      label: 'Artículos Devueltos',
      value: items.filter(i => i.content?.estado === 'Devuelto').length,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      borderColor: 'border-emerald-500',
    }
  ], [items]);

  const getStatusStyle = (estado) => {
    if (estado === 'Devuelto') {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        icon: <CheckCircle2 className="w-4 h-4" />,
        accent: 'bg-emerald-500'
      };
    }
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: <Clock className="w-4 h-4" />,
      accent: 'bg-amber-500'
    };
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Dynamic Hero Header ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white pb-32 pt-12 hero-surface relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al Panel Principal
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <BookOpen className="w-10 h-10 text-blue-100" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Control de Préstamos
                </h1>
                <p className="text-blue-200 mt-1 font-medium">
                  Gestiona y monitorea el flujo de artículos y recursos.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-white hover:bg-white/90 text-slate-900 rounded-xl font-bold flex items-center shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95 group/btn"
            >
              <Plus className="w-5 h-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
              Nuevo Préstamo
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-20 pb-20">
        {/* ── Modal Form Section ── */}
        {showForm && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={handleBackdropClick}
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  {editingItem ? 'Editar Registro' : 'Nuevo Préstamo'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" /> Artículo
                    </label>
                    <input
                      type="text"
                      name="articulo"
                      value={formData.articulo}
                      onChange={handleChange}
                      placeholder="Ej. Laptop Dell, Proyector..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> Persona Responsable
                    </label>
                    <input
                      type="text"
                      name="persona"
                      value={formData.persona}
                      onChange={handleChange}
                      placeholder="Nombre completo..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Fecha de Préstamo
                    </label>
                    <input
                      type="date"
                      name="fecha_prestamo"
                      value={formData.fecha_prestamo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Fecha de Devolución
                    </label>
                    <input
                      type="date"
                      name="fecha_devolucion"
                      value={formData.fecha_devolucion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Estado del Préstamo</label>
                    <div className="flex gap-4">
                      {['Prestado', 'Devuelto'].map((option) => (
                        <label
                          key={option}
                          className={`flex-1 cursor-pointer group relative overflow-hidden rounded-xl border-2 p-4 transition-all ${formData.estado === option
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                        >
                          <input
                            type="radio"
                            name="estado"
                            value={option}
                            checked={formData.estado === option}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${formData.estado === option ? 'text-blue-700' : 'text-gray-500'}`}>
                              {option}
                            </span>
                            {formData.estado === option && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    {editingItem ? 'Actualizar Registro' : 'Confirmar Préstamo'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
                  >
                    Descartar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Stats Dashboard ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{ animationDelay: `${idx * 100}ms` }}
              className={`bg-white border-b-4 ${stat.borderColor} rounded-3xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4`}
            >
              <div className="bg-slate-50 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── List Section ── */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                Préstamos Registrados
                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">{filteredItems.length}</span>
              </h2>
              <div className="flex gap-2">
                {['Todos', 'Prestado', 'Devuelto'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full transition-all ${statusFilter === status
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative w-full md:w-64 self-end md:self-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-medium">Sincronizando con la nube...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-xl">No se encontraron resultados</p>
              <p className="text-gray-400">Intenta con otra búsqueda o agrega un nuevo préstamo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item, idx) => {
                const status = getStatusStyle(item.content?.estado);
                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                  >
                    <div className={`h-1.5 w-full ${status.accent}`}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
                          {status.icon}
                          {item.content?.estado || 'Prestado'}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleStatus(item)}
                            title={item.content?.estado === 'Prestado' ? 'Marcar como Devuelto' : 'Reabrir Préstamo'}
                            className={`p-2 rounded-lg transition-colors ${item.content?.estado === 'Prestado'
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              }`}
                          >
                            {item.content?.estado === 'Prestado' ? <Check className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDialog({ show: true, id: item.id })}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
                        {item.content?.articulo || 'Sin nombre'}
                      </h3>

                      <div className="flex items-center text-gray-500 font-medium text-sm mb-4">
                        <User className="w-3.5 h-3.5 mr-2" />
                        {item.content?.persona || 'No asignado'}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha Salida</p>
                          <div className="flex items-center text-gray-700 font-bold text-xs">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                            {item.content?.fecha_prestamo || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Devolución</p>
                          <div className="flex items-center text-gray-700 font-bold text-xs">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                            {item.content?.fecha_devolucion || 'Pendiente'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Custom Confirm Dialog ── */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">¿Estás seguro?</h3>
            <p className="text-gray-500 font-medium mb-8">Esta acción no se puede deshacer y el registro se borrará permanentemente.</p>
            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteData(confirmDialog.id)}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
            ? 'bg-emerald-600 border-emerald-500 text-white'
            : 'bg-rose-600 border-rose-500 text-white'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <p className="font-bold tracking-tight">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlDePrestamos;
