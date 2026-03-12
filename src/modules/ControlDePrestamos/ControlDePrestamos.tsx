import { useMemo, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './ControlDePrestamos.css';
import {
    ArrowLeft, Plus, Edit, Trash2, Save, X, BookOpen,
    User, Calendar, Package, CheckCircle2, Clock,
    Search, RotateCcw, Check
} from 'lucide-react';

import { useControlDePrestamos } from './useControlDePrestamos';
import { QUICK_DATES, QUICK_HOURS } from './constants';
import React, { memo } from 'react';

// ── Sub-componente para el Hero (Memorizado para rendimiento) ──
const HeroHeader = memo(() => (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white pb-24 pt-10 relative overflow-hidden">
        {/* Elementos decorativos premium (blobs animados) */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[80%] bg-blue-600/20 blur-[120px] rounded-full animate-mesh"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[60%] bg-indigo-500/15 blur-[100px] rounded-full animate-mesh [animation-delay:2s]"></div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <Link
                to="/"
                className="inline-flex items-center text-blue-200/70 hover:text-white mb-6 transition-all hover:gap-3 group animate-reveal [animation-delay:100ms]"
            >
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold tracking-wide">Volver al Panel Principal</span>
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-white/5 rounded-[1.5rem] backdrop-blur-2xl border border-white/10 shadow-2xl group hover:scale-105 transition-all duration-500 animate-float">
                        <BookOpen className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="animate-reveal [animation-delay:300ms]">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-1 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                            Control de Préstamos
                        </h1>
                        <p className="text-blue-200/60 text-base font-medium max-w-md leading-relaxed">
                            Gestiona y monitorea el flujo de recursos con precisión.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

HeroHeader.displayName = 'HeroHeader';

function ControlDePrestamos() {
    const {
        items, loading, showForm, setShowForm, editingItem, searchTerm, setSearchTerm,
        statusFilter, setStatusFilter, formData, setFormData, toast, confirmDialog,
        setConfirmDialog, counts, showNotification, closeConfirm,
        addData, updateData, deleteData, toggleStatus, resetForm, handleEdit, extendLoan
    } = useControlDePrestamos();

    // ── Form helpers ──────────────────────────────────────

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            updateData(editingItem.id, formData);
        } else {
            addData(formData);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value = e.target.value;
        const name = e.target.name;

        // Capitalización para campos de texto
        if (name === 'articulo' || name === 'persona') {
            value = value.replace(/\b\w/g, (c) => c.toUpperCase());
        }

        // Validación de fechas
        if (name === 'fecha_devolucion' && value < formData.fecha_prestamo && value !== '') {
            showNotification('La fecha de devolución no puede ser anterior al préstamo', 'error');
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const setQuickDate = (name: 'fecha_prestamo' | 'fecha_devolucion', daysToAdd: number) => {
        const date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        const dateString = date.toISOString().split('T')[0];

        if (name === 'fecha_devolucion' && dateString < formData.fecha_prestamo) {
            showNotification('La fecha no puede ser anterior al préstamo', 'error');
            return;
        }

        setFormData({ ...formData, [name]: dateString });
    };

    // ── Helpers de UI ──────────────────────────────
    const stats = useMemo(() => [
        {
            label: 'Total Préstamos',
            value: counts.total,
            icon: <BookOpen className="w-6 h-6 text-blue-600" />,
            borderColor: 'border-blue-500',
        },
        {
            label: 'Préstamos Activos',
            value: counts.activos,
            icon: <Clock className="w-6 h-6 text-amber-600" />,
            borderColor: 'border-amber-500',
        },
        {
            label: 'Artículos Devueltos',
            value: counts.devueltos,
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
            borderColor: 'border-emerald-500',
        }
    ], [counts]);

    const getStatusStyle = (estado: string) => {
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

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            resetForm();
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ── Memoized Hero Header ── */}
            <HeroHeader />

            <div className="container mx-auto px-4 max-w-7xl -mt-10 pb-20 relative z-10">
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
                                                        onChange={() => setFormData({ ...formData, estado: option as any })}
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

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <aside className="w-full lg:w-64 lg:sticky lg:top-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 transition-all duration-500">
                        <div className="px-1">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Panel de Control</h3>
                            <p className="text-base font-black text-slate-800">Estadísticas</p>
                        </div>
                        <div className="space-y-4">
                            {stats.map((stat, idx) => (
                                <div
                                    key={idx}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                    className={`bg-slate-50/50 border-l-4 ${stat.borderColor} rounded-xl p-4 flex items-center gap-3 hover:bg-white hover:shadow-md transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4`}
                                >
                                    <div className="bg-white p-2.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                                        {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-5 h-5' })}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-0.5 truncate">{stat.label}</p>
                                        <p className="text-xl font-black text-slate-800">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Sidebar Search ── */}
                        <div className="pt-4 border-t border-slate-50">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Búsqueda rápida</h3>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-slate-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </aside>

                    {/* ── List Section ── */}
                    <div className="flex-1 w-full space-y-5">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2 sticky top-6 z-[40] p-4 lg:p-5 rounded-[2rem] bg-white shadow-xl shadow-slate-200/40 border border-slate-100">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-xl font-black flex items-center gap-3 text-slate-800 transition-all">
                                        Préstamos
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100/50 font-bold">
                                            {items.length}
                                        </span>
                                    </h2>
                                </div>

                                <div className="flex flex-wrap gap-1.5 animate-in fade-in duration-500">
                                    {['Todos', 'Prestado', 'Devuelto'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg transition-all ${statusFilter === status
                                                ? 'bg-slate-800 text-white shadow-md'
                                                : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full md:w-auto p-3 rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 shrink-0 flex items-center justify-center gap-2 font-bold bg-blue-600 text-white shadow-blue-500/20"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-xs">Nuevo Préstamo</span>
                            </button>
                        </div>

                        {loading ? (
                            <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400 font-medium">Sincronizando con la nube...</p>
                            </div>
                        ) : items.length === 0 ? (
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

                                    return items.map((item, idx) => {
                                        const content = item.content || {};
                                        const status = getStatusStyle(content.estado);
                                        const isLate = content.estado === 'Prestado' &&
                                            content.fecha_devolucion &&
                                            new Date(content.fecha_devolucion + 'T23:59:59') < today;

                                        return (
                                            <div
                                                key={item.id}
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                                className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4"
                                            >
                                                {/* Indicador lateral de estado */}
                                                <div className={`w-full md:w-3 h-3 md:h-auto ${isLate ? 'bg-rose-500 animate-pulse' : status.accent} transition-colors`}></div>

                                                <div className="flex-1 p-4 md:p-5 flex flex-col md:flex-row items-center gap-6">
                                                    {/* Sección de Icono y Articulo */}
                                                    <div className="flex items-center gap-4 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-50 pb-4 md:pb-0 md:pr-6">
                                                        <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500`}>
                                                            <Package className={`w-6 h-6 ${status.text}`} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-xl font-black text-gray-800 truncate group-hover:text-blue-700 transition-colors lowercase first-letter:uppercase">
                                                                {item.content?.articulo || 'Sin nombre'}
                                                            </h3>
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-1 ${status.bg} ${status.text}`}>
                                                                {React.cloneElement(status.icon as React.ReactElement, { className: 'w-3 h-3' })}
                                                                {item.content?.estado || 'Prestado'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sección de Datos y Fechas */}
                                                    <div className="flex-1 flex flex-col xl:flex-row flex-wrap items-center gap-y-4 gap-x-8 w-full">
                                                        {/* Responsable */}
                                                        <div className="min-w-[120px]">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Responsable</p>
                                                            <div className="flex items-center text-gray-700 font-bold text-sm">
                                                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-slate-500 shrink-0">
                                                                    <User className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="truncate">{item.content?.persona || 'No asignado'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Periodo */}
                                                        <div className="flex-1 min-w-[180px]">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Periodo</p>
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-center text-gray-600 font-bold text-[11px] whitespace-nowrap">
                                                                    <Calendar className="w-3 h-3 mr-1.5 text-blue-500 shrink-0" />
                                                                    <span>{item.content?.fecha_prestamo}</span>
                                                                    <span className="mx-1.5 text-gray-300">→</span>
                                                                    <span className={item.content?.fecha_devolucion ? 'text-gray-800' : 'text-gray-400 italic'}>
                                                                        {item.content?.fecha_devolucion || 'Pendiente'}
                                                                    </span>
                                                                </div>
                                                                {item.content?.hora_limite && (
                                                                    <div className="flex items-center text-amber-600 font-black text-[9px] uppercase tracking-tighter">
                                                                        <Clock className="w-2.5 h-2.5 mr-1 shrink-0" />
                                                                        Límite: {item.content.hora_limite}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Acciones Rápidas */}
                                                        <div className="flex items-center justify-center md:justify-end gap-2 shrink-0 ml-auto w-full xl:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                                                            {item.content?.estado === 'Prestado' && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); extendLoan(item, 1); }}
                                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-black text-[9px] uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
                                                                >
                                                                    <Plus className="w-2.5 h-2.5" /> +1 Día
                                                                </button>
                                                            )}
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    onClick={() => toggleStatus(item)}
                                                                    title={item.content?.estado === 'Prestado' ? 'Marcar como Devuelto' : 'Reabrir Préstamo'}
                                                                    className={`p-2 rounded-lg transition-all shadow-sm transform hover:scale-105 ${item.content?.estado === 'Prestado'
                                                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-emerald-100 border border-emerald-100'
                                                                        : 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white shadow-amber-100 border border-amber-100'
                                                                        }`}
                                                                >
                                                                    {item.content?.estado === 'Prestado' ? <Check className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm shadow-blue-100 border border-blue-100 transform hover:scale-105"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmDialog({ show: true, id: item.id })}
                                                                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all shadow-sm shadow-rose-100 border border-rose-100 transform hover:scale-105"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

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
                                onClick={() => confirmDialog.id && deleteData(confirmDialog.id)}
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
