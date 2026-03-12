import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { LoanItem, LoanContent, LoanCounts } from './types';
import { MODULE_OWNER, INITIAL_FORM_STATE } from './constants';

export function useControlDePrestamos() {
    const [items, setItems] = useState<LoanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<LoanItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [formData, setFormData] = useState<LoanContent>(INITIAL_FORM_STATE);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmDialog, setConfirmDialog] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
    const [counts, setCounts] = useState<LoanCounts>({ total: 0, activos: 0, devueltos: 0 });

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    }, []);

    const closeConfirm = () => setConfirmDialog({ show: false, id: null });

    const fetchCounts = useCallback(async () => {
        try {
            const [totalRes, activosRes, devueltosRes] = await Promise.all([
                supabase.from('student_modules').select('id', { count: 'exact', head: true }).eq('module_owner', MODULE_OWNER),
                supabase.from('student_modules').select('id', { count: 'exact', head: true }).eq('module_owner', MODULE_OWNER).contains('content', { estado: 'Prestado' }),
                supabase.from('student_modules').select('id', { count: 'exact', head: true }).eq('module_owner', MODULE_OWNER).contains('content', { estado: 'Devuelto' })
            ]);

            setCounts({
                total: totalRes.count || 0,
                activos: activosRes.count || 0,
                devueltos: devueltosRes.count || 0
            });
        } catch (err) {
            console.error('Error fetching counts:', err);
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('student_modules')
                .select('id, content')
                .eq('module_owner', MODULE_OWNER)
                .order('created_at', { ascending: false });

            if (statusFilter !== 'Todos') {
                query = query.contains('content', { estado: statusFilter });
            }

            if (searchTerm.trim()) {
                const searchSafe = `%${searchTerm}%`;
                query = query.or(`content->>articulo.ilike.${searchSafe},content->>persona.ilike.${searchSafe}`);
            }

            const { data, error } = await query;
            if (error) throw error;

            setItems(data as LoanItem[] || []);
            fetchCounts();
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, fetchCounts]);

    useEffect(() => {
        const timer = setTimeout(fetchData, 400);
        return () => clearTimeout(timer);
    }, [fetchData]);


    const addData = async (content: LoanContent) => {
        try {
            const { data, error } = await supabase
                .from('student_modules')
                .insert([{ module_owner: MODULE_OWNER, content }])
                .select();

            if (error) throw error;
            if (data) {
                setItems([data[0] as LoanItem, ...items]);
                fetchCounts();
                resetForm();
                showNotification('¡Registro agregado correctamente!');
            }
        } catch (error: any) {
            console.error('Error adding data:', error.message);
            showNotification('Error al agregar el registro', 'error');
        }
    };

    const updateData = async (id: string, content: LoanContent) => {
        try {
            const { error } = await supabase
                .from('student_modules')
                .update({ content })
                .eq('id', id);

            if (error) throw error;
            setItems(items.map((item) => (item.id === id ? { ...item, content } : item)));
            resetForm();
            showNotification('Registro actualizado con éxito');
        } catch (error: any) {
            console.error('Error updating data:', error.message);
            showNotification('Error al actualizar el registro', 'error');
        }
    };

    const deleteData = async (id: string) => {
        try {
            const { error } = await supabase
                .from('student_modules')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setItems(items.filter((item) => item.id !== id));
            fetchCounts();
            showNotification('Registro eliminado del sistema', 'success');
            closeConfirm();
        } catch (error: any) {
            console.error('Error deleting data:', error.message);
            showNotification('Error al eliminar el registro', 'error');
        }
    };

    const toggleStatus = useCallback(async (item: LoanItem) => {
        const content = item.content || {};
        const newStatus: 'Prestado' | 'Devuelto' = content.estado === 'Prestado' ? 'Devuelto' : 'Prestado';
        const newContent = { ...content, estado: newStatus };

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
            fetchCounts();
            showNotification(`Estado actualizado a: ${newStatus}`);
        } catch (error: any) {
            console.error('Error toggling status:', error.message);
            showNotification('Error al cambiar el estado', 'error');
        }
    }, [fetchCounts, showNotification]);

    const resetForm = useCallback(() => {
        setShowForm(false);
        setEditingItem(null);
        setFormData(INITIAL_FORM_STATE);
    }, []);

    const handleEdit = (item: LoanItem) => {
        setEditingItem(item);
        setFormData(item.content || INITIAL_FORM_STATE);
        setShowForm(true);
    };

    const extendLoan = useCallback(async (item: LoanItem, days: number) => {
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
        } catch (error: any) {
            console.error('Error extending loan:', error.message);
            showNotification('Error al extender el préstamo', 'error');
        }
    }, [showNotification]);

    return {
        items, loading, showForm, setShowForm, editingItem, searchTerm, setSearchTerm,
        statusFilter, setStatusFilter, formData, setFormData, toast, confirmDialog,
        setConfirmDialog, counts, showNotification, closeConfirm,
        addData, updateData, deleteData, toggleStatus, resetForm, handleEdit, extendLoan
    };
}
