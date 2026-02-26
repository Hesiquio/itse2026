import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle, Moon, Sun } from 'lucide-react';

// Helpers para Colores Dinámicos
const getPriorityClass = (priority) => {
    if (!priority) return '';
    if (priority.includes('Urgente e Importante')) return 'priority-urgent-urgent';
    if (priority.includes('No Urgente pero Importante')) return 'priority-nonurgent-important';
    if (priority.includes('Urgente pero No Importante')) return 'priority-urgent-nonimportant';
    if (priority.includes('No Urgente y No Importante')) return 'priority-nonurgent-nonimportant';
    return '';
};

const getStatusClass = (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('definición')) return 'status-ideacion';
    if (s.includes('progreso')) return 'status-progreso';
    if (s.includes('verificación')) return 'status-verificacion';
    if (s.includes('completado')) return 'status-completado';
    if (s.includes('pospuesto')) return 'status-pospuesto';
    return '';
};

function MetasModuleTemplate({ moduleName, moduleOwner, fields }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Soporte para Modo Dual local
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('metas-theme');
        return saved === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('metas-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

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

    const handleQuickToggle = (item, fieldName) => {
        const field = fields.find(f => f.name === fieldName);
        if (!field || !field.options) return;

        const currentVal = item.content[fieldName];
        const currentIndex = field.options.indexOf(currentVal);
        const nextIndex = (currentIndex + 1) % field.options.length;
        const nextValue = field.options[nextIndex];

        updateData(item.id, { ...item.content, [fieldName]: nextValue });
    };

    // Renderizador de Barra de Progreso
    const renderProgressBar = (item) => {
        const value = item.content.progreso || '0%';
        const numValue = parseInt(value) || 0;
        let colorClass = 'progress-low';
        if (numValue >= 75) colorClass = 'progress-high';
        else if (numValue >= 50) colorClass = 'progress-mid';

        return (
            <div className="mt-2">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                    <span>PROGRESO</span>
                    <span>{value}</span>
                </div>
                <div
                    className="metas-progress-track"
                    onClick={() => handleQuickToggle(item, 'progreso')}
                    title="Clic para aumentar progreso"
                >
                    <div
                        className={`metas-progress-bar ${colorClass}`}
                        style={{ width: value }}
                    ></div>
                </div>
            </div>
        );
    };

    const isRLSError = errorMsg && (
        errorMsg.includes('row-level') || errorMsg.includes('42501') || errorMsg.includes('permission')
    );

    return (
        <div className={`metas-module-container ${isDarkMode ? 'dark' : 'light'}`}>
            <button
                className="theme-toggle-btn"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Cambiar Tema"
            >
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            <div className="container mx-auto px-4 py-12">
                <div className="mb-10">
                    <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-transform hover:-translate-x-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al inicio
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-4xl font-extrabold">{moduleName}</h1>
                        <button
                            onClick={() => { setShowForm(!showForm); setEditingItem(null); setErrorMsg(null); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all shadow-lg active:scale-95"
                        >
                            {showForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                            {showForm ? 'Cancelar' : 'Agregar Nueva Meta'}
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl px-6 py-4">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <div className="flex-1">
                                <p className="font-bold">Aviso del Sistema</p>
                                <p className="text-sm font-mono mt-2 bg-white/50 dark:bg-black/20 p-2 rounded">{errorMsg}</p>
                                {isRLSError && (
                                    <div className="mt-4 text-xs bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <p className="font-bold mb-1">💡 Tips de Configuración:</p>
                                        <p>Desabilita RLS en Supabase:</p>
                                        <code>ALTER TABLE student_modules DISABLE ROW LEVEL SECURITY;</code>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setErrorMsg(null)}><X className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 flex items-center gap-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-200 rounded-2xl px-6 py-4 animate-bounce-in">
                        <CheckCircle className="w-6 h-6" />
                        <p className="font-semibold">{successMsg}</p>
                    </div>
                )}

                {showForm && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 transition-all border border-gray-100 dark:border-gray-800">
                        <h2 className="text-3xl font-bold mb-8">
                            {editingItem ? 'Actualizar' : 'Crear'} {moduleName}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {fields.map((field) => (
                                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                    <label className="metas-label">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full"
                                            rows="4"
                                            required={field.required}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full"
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
                                            className="w-full"
                                            required={field.required}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="md:col-span-2 flex gap-4 mt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold flex items-center transition-all disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5 mr-3" />
                                    {saving ? 'Guardando...' : 'Guardar Meta Ahora'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-xl font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold">Listado de Metas</h2>
                        <button onClick={fetchData} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="sr-only">Recargar</span>
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Sincronizando tus metas...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                            <p className="text-gray-500 text-xl font-semibold mb-2">Aún no has definido metas</p>
                            <p className="text-gray-400">Comienza haciendo clic en "Agregar Nueva Meta"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {items.map((item) => (
                                <div key={item.id} className="metas-item-card group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold group-hover:text-purple-600 transition-colors mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                                                {item.content.meta}
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="metas-label">Categoría</span>
                                                        <span className="font-semibold">{item.content.categoria || 'Sin definir'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="metas-label">Prioridad</span>
                                                        <span
                                                            className={`metas-badge ${getPriorityClass(item.content.prioridad)}`}
                                                            onClick={() => handleQuickToggle(item, 'prioridad')}
                                                            title="Clic para cambiar prioridad"
                                                        >
                                                            {item.content.prioridad}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="metas-label">Estado</span>
                                                    <span
                                                        className={`metas-badge ${getStatusClass(item.content.estado)}`}
                                                        onClick={() => handleQuickToggle(item, 'estado')}
                                                        title="Clic para cambiar estado"
                                                    >
                                                        {item.content.estado}
                                                    </span>
                                                </div>

                                                {renderProgressBar(item)}

                                                <div>
                                                    <span className="metas-label">Plan de Acción</span>
                                                    <p className="text-sm opacity-80 line-clamp-2">{item.content.descripcion}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                                <span>Creado {new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 ml-4">
                                            <button onClick={() => handleEdit(item)} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:scale-110 transition-transform shadow-sm">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => deleteData(item.id)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:scale-110 transition-transform shadow-sm">
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

export default MetasModuleTemplate;
