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
  hora_limite: '14:00',
  estado: 'Prestado',
};

const QUICK_DATES = [
  { label: '+3 días', days: 3 },
  { label: '+1 sem', days: 7 },
  { label: '+15 días', days: 15 },
  { label: '+1 mes', days: 30 }
];

const QUICK_HOURS = ['10:00', '14:00', '16:00', '18:00'];

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
  const [isScrolled, setIsScrolled] = useState(false);

  const showNotification = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const closeConfirm = () => setConfirmDialog({ show: false, id: null });

  useEffect(() => {
    fetchData();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const setQuickDate = (name, daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const dateString = date.toISOString().split('T')[0];

    if (name === 'fecha_devolucion' && dateString < formData.fecha_prestamo) {
      showNotification('La fecha no puede ser anterior al préstamo', 'error');
      return;
    }

    setFormData({ ...formData, [name]: dateString });
  };

  const extendLoan = useCallback(async (item, days) => {
    const currentContent = item.content || {};
    const baseDateString = currentContent.fecha_devolucion || currentContent.fecha_prestamo || new Date().toISOString().split('T')[0];

    const baseDate = new Date(baseDateString + 'T00:00:00');
    baseDate.setDate(baseDate.getDate() + days);

    const newDateString = baseDate.toISOString().split('T')[0];
    const newContent = { ...currentContent, fecha_devolucion: newDateString };

    try {
      const { error } = await supabase
        .from('student_modules')
        .update({ content: newContent })
        .eq('id', item.id);

      if (error) throw error;
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, content: newContent } : i));
      showNotification(`Préstamo extendido hasta el ${newDateString}`);
    } catch (error) {
      console.error('Error extending loan:', error.message);
      showNotification('Error al extender el préstamo', 'error');
    }
  }, [showNotification]);

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
      <div className={`bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white pb-32 pt-12 hero-surface relative overflow-hidden transition-opacity duration-500 ${isScrolled ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}>
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
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickDate('fecha_prestamo', 0)}
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate('fecha_prestamo', -1)}
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Ayer
                      </button>
                    </div>
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
                    <div className="flex flex-wrap gap-2">
                      {QUICK_DATES.map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => setQuickDate('fecha_devolucion', btn.days)}
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Hora Límite de Devolución
                    </label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <input
                        type="time"
                        name="hora_limite"
                        value={formData.hora_limite}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                      />
                      <div className="flex gap-2 items-center">
                        {QUICK_HOURS.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, hora_limite: t })}
                            className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg transition-all ${formData.hora_limite === t
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
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
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 transition-all duration-500 ${isScrolled ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}>
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
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 mb-2 sticky top-4 z-[40] p-4 rounded-3xl transition-all duration-300 ${isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-xl border border-white translate-y-2'
            : 'bg-transparent'
            }`}>
            <div className="flex flex-col gap-1">
              <h2 className={`font-black flex items-center gap-3 transition-all ${isScrolled ? 'text-lg text-blue-900' : 'text-2xl text-slate-800'}`}>
                Préstamos Registrados
                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">{filteredItems.length}</span>
              </h2>
              {!isScrolled && (
                <div className="flex gap-2 animate-in fade-in duration-500">
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
              )}
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border transition-all text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isScrolled ? 'bg-slate-50 border-slate-200' : 'bg-white border-gray-200'
                    }`}
                />
              </div>
              {isScrolled && (
                <button
                  onClick={() => setShowForm(true)}
                  className="p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95 animate-in zoom-in"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
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
            <div className="flex flex-col gap-6">
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                return filteredItems.map((item, idx) => {
                  const content = item.content || {};
                  const status = getStatusStyle(content.estado);
                  const isLate = content.estado === 'Prestado' &&
                    content.fecha_devolucion &&
                    new Date(content.fecha_devolucion + 'T23:59:59') < today;

                  return (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4"
                    >
                      {/* Indicador lateral de estado */}
                      <div className={`w-full md:w-3 h-3 md:h-auto ${isLate ? 'bg-rose-500 animate-pulse' : status.accent} transition-colors`}></div>

                      <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                        {/* Sección de Icono y Articulo */}
                        <div className="flex items-center gap-6 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-50 pb-6 md:pb-0 md:pr-8">
                          <div className={`w-16 h-16 rounded-2xl ${status.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <Package className={`w-8 h-8 ${status.text}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-2xl font-black text-gray-800 truncate group-hover:text-blue-700 transition-colors lowercase first-letter:uppercase">
                              {item.content?.articulo || 'Sin nombre'}
                            </h3>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 ${status.bg} ${status.text}`}>
                              {status.icon}
                              {item.content?.estado || 'Prestado'}
                            </div>
                          </div>
                        </div>

                        {/* Sección de Datos y Fechas */}
                        <div className="flex-1 flex flex-col xl:flex-row flex-wrap items-center gap-y-6 gap-x-12 w-full">
                          {/* Responsable */}
                          <div className="min-w-[140px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Responsable</p>
                            <div className="flex items-center text-gray-700 font-bold">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500 shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="truncate">{item.content?.persona || 'No asignado'}</span>
                            </div>
                          </div>

                          {/* Periodo */}
                          <div className="flex-1 min-w-[200px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Periodo</p>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-gray-600 font-bold text-xs whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500 shrink-0" />
                                <span>{item.content?.fecha_prestamo}</span>
                                <span className="mx-2 text-gray-300">→</span>
                                <span className={item.content?.fecha_devolucion ? 'text-gray-800' : 'text-gray-400 italic'}>
                                  {item.content?.fecha_devolucion || 'Pendiente'}
                                </span>
                              </div>
                              {item.content?.hora_limite && (
                                <div className="flex items-center text-amber-600 font-black text-[10px] uppercase tracking-tighter">
                                  <Clock className="w-3 h-3 mr-1.5 shrink-0" />
                                  Límite: {item.content.hora_limite}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Acciones Rápidas */}
                          <div className="flex items-center justify-center md:justify-end gap-3 shrink-0 ml-auto w-full xl:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                            {item.content?.estado === 'Prestado' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); extendLoan(item, 1); }}
                                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                              >
                                <Plus className="w-3 h-3" /> +1 Día
                              </button>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleStatus(item)}
                                title={item.content?.estado === 'Prestado' ? 'Marcar como Devuelto' : 'Reabrir Préstamo'}
                                className={`p-3 rounded-xl transition-all shadow-sm transform hover:scale-105 ${item.content?.estado === 'Prestado'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-emerald-100 border border-emerald-100'
                                  : 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white shadow-amber-100 border border-amber-100'
                                  }`}
                              >
                                {item.content?.estado === 'Prestado' ? <Check className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm shadow-blue-100 border border-blue-100 transform hover:scale-105"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setConfirmDialog({ show: true, id: item.id })}
                                className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm shadow-rose-100 border border-rose-100 transform hover:scale-105"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Badge de Alerta si está vencido */}
                      {/* Badge de Alerta si está vencido */}
                      {isLate && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                          Préstamo Vencido
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
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
