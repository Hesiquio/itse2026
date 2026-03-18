import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import {
    ArrowLeft, Search, Filter, Plus, Calendar, Settings,
    Bell, FileText, CheckCircle, AlertCircle, RefreshCw,
    Monitor, Speaker, Lightbulb, User, X, Save
} from 'lucide-react';

function Luces() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [searchQuery, setSearchQuery] = useState('');

    // Datos de Supabase
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [rentals, setRentals] = useState([]);
    const [loadingRentals, setLoadingRentals] = useState(false);

    // Estado para el formulario de agregar
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        id: '', category: 'Lighting', name: '', brand: '', qtyTotal: 1, status: 'Disponible'
    });

    // Módulo Salida/Renta
    const [rentCart, setRentCart] = useState([]);
    const [rentForm, setRentForm] = useState({
        client: '', event: '', dateOut: '', dateReturn: ''
    });

    const MODULE_OWNER = 'Luces';

    useEffect(() => {
        fetchItems();
        fetchRentals();
    }, []);

    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(null), 3000);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    const fetchRentals = async () => {
        try {
            setLoadingRentals(true);
            const { data, error } = await supabase
                .from('student_modules')
                .select('*')
                .eq('module_owner', 'Luces_Rentas')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const parsedRentals = (data || []).map(row => ({
                id: row.id,
                ...row.content
            }));
            setRentals(parsedRentals);
        } catch (error) {
            console.error('Error fetching rentals:', error.message);
        } finally {
            setLoadingRentals(false);
        }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('student_modules')
                .select('*')
                .eq('module_owner', MODULE_OWNER)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Mapeamos los datos de Supabase ({ id, content: { ... } }) a un arreglo plano para la tabla
            const parsedItems = (data || []).map(row => ({
                supabaseId: row.id,
                ...row.content
            }));

            setItems(parsedItems);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            setErrorMsg('Error al cargar inventario: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        // Al crear un nuevo equipo, toda la cantidad entra a la "Bodega"
        const contentToSave = {
            ...formData,
            qtyIn: formData.qtyTotal,
            qtyOut: 0
        };

        try {
            const { data, error } = await supabase
                .from('student_modules')
                .insert([{ module_owner: MODULE_OWNER, content: contentToSave }])
                .select();

            if (error) throw error;

            // Actualizar la lista local inmediatamente
            const newItem = {
                supabaseId: data[0].id,
                ...data[0].content
            };

            setItems([newItem, ...items]);
            setSuccessMsg('¡Equipo registrado correctamente!');
            setShowAddForm(false);
            setFormData({ id: '', category: 'Lighting', name: '', brand: '', qtyTotal: 1, status: 'Disponible' });
        } catch (error) {
            console.error('Error saving data:', error.message);
            setErrorMsg('Error al guardar equipo: ' + error.message);
        }
    };

    // LOGICA DE SALIDA / RENTA
    const handleAddToCart = (item) => {
        if (!rentCart.find(c => c.supabaseId === item.supabaseId)) {
            setRentCart([...rentCart, { ...item, qtyToRent: 1 }]);
        }
    };

    const handleRemoveFromCart = (id) => {
        setRentCart(rentCart.filter(item => item.supabaseId !== id));
    };

    const handleUpdateCartQty = (id, newQty) => {
        setRentCart(rentCart.map(item => {
            if (item.supabaseId === id) {
                // Validación para no rentar más de lo disponible en bodega
                const maxQty = item.qtyIn;
                return { ...item, qtyToRent: Math.min(Math.max(1, newQty), maxQty) };
            }
            return item;
        }));
    };

    const handleRentSubmit = async (e) => {
        e.preventDefault();
        if (rentCart.length === 0) {
            setErrorMsg('Debes agregar al menos un equipo para la salida.');
            return;
        }

        setErrorMsg(null);
        setLoading(true);

        try {
            // Actualizar cada uno de los items en base de datos
            for (const cartItem of rentCart) {
                const newQtyIn = cartItem.qtyIn - cartItem.qtyToRent;
                const newQtyOut = cartItem.qtyOut + cartItem.qtyToRent;
                const newStatus = newQtyIn === 0 ? 'Rentado' : 'Parcialmente Rentado';

                // Reconstruimos el objeto original sin supabaseId y qtyToRent para el content
                const originalItem = items.find(i => i.supabaseId === cartItem.supabaseId);
                const updatedContent = {
                    ...originalItem,
                    qtyIn: newQtyIn,
                    qtyOut: newQtyOut,
                    status: newStatus
                };
                delete updatedContent.supabaseId; // no guardar supabaseId dentro de content

                const { error } = await supabase
                    .from('student_modules')
                    .update({ content: updatedContent })
                    .eq('id', cartItem.supabaseId);

                if (error) throw error;
            }

            // Registro del historial de rentas
            const rentRecord = {
                ...rentForm,
                dateCreated: new Date().toISOString(),
                items: rentCart.map(i => ({ id: i.supabaseId, name: i.name, qty: i.qtyToRent }))
            };

            const { error: rentError } = await supabase
                .from('student_modules')
                .insert([{ module_owner: 'Luces_Rentas', content: rentRecord }]);

            if (rentError) {
                console.error("Error guardando reporte de renta:", rentError);
            }

            setSuccessMsg('¡Renta confirmada con éxito! Revisa tu inventario.');
            setRentCart([]);
            setRentForm({ client: '', event: '', dateOut: '', dateReturn: '' });
            fetchItems(); // Recargamos inventario
            fetchRentals(); // Recargar historial de rentas
            setActiveTab('inventory');
        } catch (error) {
            setErrorMsg('Error registrando salida: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReturnRent = async (renta) => {
        try {
            setLoadingRentals(true);

            for (const rentedItem of renta.items) {
                const originalItem = items.find(i => i.supabaseId === rentedItem.id);
                if (originalItem) {
                    const newQtyIn = originalItem.qtyIn + rentedItem.qty;
                    const newQtyOut = Math.max(0, originalItem.qtyOut - rentedItem.qty);
                    const newStatus = newQtyIn === originalItem.qtyTotal ? 'Disponible' : (newQtyIn === 0 ? 'Rentado' : 'Parcialmente Rentado');

                    const updatedContent = {
                        ...originalItem,
                        qtyIn: newQtyIn,
                        qtyOut: newQtyOut,
                        status: newStatus
                    };
                    delete updatedContent.supabaseId;

                    await supabase
                        .from('student_modules')
                        .update({ content: updatedContent })
                        .eq('id', rentedItem.id);
                }
            }

            const updatedRentRecord = {
                ...renta,
                status: 'Devuelta',
                returnDate: new Date().toISOString()
            };
            delete updatedRentRecord.id;

            await supabase
                .from('student_modules')
                .update({ content: updatedRentRecord })
                .eq('id', renta.id);

            setSuccessMsg('¡Equipos devueltos exitosamente!');
            fetchItems();
            fetchRentals();
        } catch (error) {
            setErrorMsg('Error al procesar devolución: ' + error.message);
        } finally {
            setLoadingRentals(false);
        }
    };

    return (
        <div className="flex bg-[#121212] min-h-screen text-gray-300 font-sans">

            {/* SIDEBAR LATERAL */}
            <aside className="w-64 bg-[#1a1c1a] border-r border-[#2a2c2a] flex flex-col hidden md:flex relative overflow-hidden">
                {/* Fondo de patrón de bananos (simulado en el diseño original) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4ade80 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                <div className="p-6 relative z-10 flex items-center gap-3">
                    <div className="bg-green-500 rounded-lg p-2 flex items-center justify-center">
                        {/* Logo de banana */}
                        <svg viewBox="0 0 24 24" fill="black" className="w-6 h-6">
                            <path d="M12.5 15C13 14 14 12 15 10C15 8.5 14 8 13.5 8C12.5 8 12 9.5 11.5 11C11 12.5 10 14.5 10.5 15.5C11 16.5 12 16 12.5 15Z" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.231 16.5162C9.28912 14.6294 10.1554 11.8317 11.08 9.49216C11.5273 8.36015 12.0152 7.12513 12.5841 6.27515C13.2386 5.29747 14.2811 4.5 15.5 4.5C16.892 4.5 18 5.608 18 7C18 8.016 17.438 9.4 16.793 11C16.147 12.602 15.424 14.43 14.93 16.183C14.442 17.915 14.212 19.5 14.5 20.5C14.653 21.031 15 21 15 21C15 21 13 21 12 21C11.166 21 10.742 20.735 10.5 20.518C10.2828 20.3228 10.1502 20.0631 10.2227 19.8242C10.2975 19.5779 10.4914 19.4627 10.7139 19.4641C10.9765 19.4657 11.3976 19.5103 11.9056 19.1417C12.4497 18.7468 13.0641 17.7267 13.5615 16.1428C14 14.746 14.697 13.018 15.326 11.458C15.955 9.897 16.5 8.5 16.5 7.5C16.5 6.772 16.035 6 15.5 6C14.965 6 14.331 6.5 13.882 7.172C13.388 7.91 12.923 9.085 12.483 10.199C11.597 12.438 10.8 14.453 11.5 15.856C12.2 17.259 13.5 18 14.5 18C15 18 15.5 17.776 15.5 17.5C15.5 17.224 15.052 17 14.5 17C13.81 17 12.83 16.5 12.352 15.5M10.231 16.5162L11.5582 15.8524L10.231 16.5162Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-white leading-tight mt-1">JAMR</h2>
                        <p className="text-green-500 text-xs tracking-wider uppercase">renta-inventario</p>
                    </div>
                </div>

                <nav className="flex-1 mt-6">
                    <Link to="/" className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#252825] transition-colors mb-4">
                        <ArrowLeft className="w-5 h-5 mr-3" /> Volver al Inicio
                    </Link>

                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`w-full flex items-center px-6 py-3 transition-colors ${activeTab === 'inventory' ? 'bg-[#252825] text-green-500 border-r-2 border-green-500' : 'text-gray-400 hover:text-white hover:bg-[#202220]'}`}
                            >
                                <FileText className="w-5 h-5 mr-3" />
                                <span className="text-left">Inventario<br /><span className="text-xs text-gray-500">(La "Bodega")</span></span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('existencia')}
                                className={`w-full flex items-center px-6 py-3 transition-colors ${activeTab === 'existencia' ? 'bg-[#252825] text-green-500 border-r-2 border-green-500' : 'text-gray-400 hover:text-white hover:bg-[#202220]'}`}
                            >
                                <CheckCircle className="w-5 h-5 mr-3" />
                                <span className="text-left">En Existencia<br /><span className="text-xs text-gray-500">(Disponibles)</span></span>
                            </button>
                        </li>
                        <li className="px-4 my-2"><div className="h-px bg-[#2a2c2a] w-full" /></li>
                        <li>
                            <button
                                onClick={() => setActiveTab('salida')}
                                className={`w-full flex items-center px-6 py-3 transition-colors ${activeTab === 'salida' ? 'bg-[#252825] text-green-500 border-r-2 border-green-500' : 'text-gray-400 hover:text-white hover:bg-[#202220]'}`}
                            >
                                <RefreshCw className="w-5 h-5 mr-3" /> Salida / Renta
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('retorno')}
                                className={`w-full flex items-center px-6 py-3 transition-colors ${activeTab === 'retorno' ? 'bg-[#252825] text-green-500 border-r-2 border-green-500' : 'text-gray-400 hover:text-white hover:bg-[#202220]'}`}
                            >
                                <RefreshCw className="w-5 h-5 mr-3 transform rotate-180" /> Retorno / Check-in
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('rentas')}
                                className={`w-full flex items-center px-6 py-3 transition-colors ${activeTab === 'rentas' ? 'bg-[#252825] text-green-500 border-r-2 border-green-500' : 'text-gray-400 hover:text-white hover:bg-[#202220]'}`}
                            >
                                <Calendar className="w-5 h-5 mr-3" /> Rentas Realizadas
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col min-h-screen">

                {/* TOP NAVBAR */}
                <header className="h-20 border-b border-[#2a2c2a] flex items-center justify-between px-8 bg-[#121212]">
                    <h1 className="text-2xl text-white font-medium">Luces & AV</h1>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar equipo..."
                                className="bg-[#1a1c1a] border border-[#2a2c2a] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-green-500 w-64 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowAddForm(true); setActiveTab('inventory'); }}
                                className="bg-[#1a1c1a] hover:bg-[#252825] text-green-500 border border-green-500/30 px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Agregar Nuevo
                            </button>
                        </div>
                    </div>
                </header>

                {/* CONTENIDO PRINCIPAL */}
                <div className="p-8 flex-1 overflow-auto bg-[#121212]">

                    {/* Alertas de Éxito / Error */}
                    {errorMsg && (
                        <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
                            <div>
                                <p className="font-semibold">Ocurrió un error</p>
                                <p className="text-sm mt-1">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 bg-green-900/20 border border-green-500/50 text-green-400 rounded-lg px-4 py-3 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{successMsg}</p>
                        </div>
                    )}

                    {/* TAB: INVENTARIO O EXISTENCIA */}
                    {(activeTab === 'inventory' || activeTab === 'existencia') && (
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* Formulario para agregar (se muestra si showAddForm es true) */}
                            {showAddForm && (
                                <div className="bg-[#1a1c1a] p-6 rounded-xl border border-green-500/30 shadow-lg mb-6 relative">
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-lg font-medium text-white mb-4">Agregar Nuevo Equipo al Inventario</h3>

                                    <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">ID del Activo</label>
                                            <input type="text" required value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full bg-[#121212] border border-[#2a2c2a] rounded p-2 text-sm focus:border-green-500 focus:outline-none" placeholder="Ej: 4520021" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Categoría</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-[#121212] border border-[#2a2c2a] rounded p-2 text-sm focus:border-green-500 focus:outline-none">
                                                <option value="Audio">Audio</option>
                                                <option value="Lighting">Iluminación</option>
                                                <option value="Screens">Pantallas</option>
                                                <option value="Cables">Cables/Accesorios</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Nombre del Equipo</label>
                                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#121212] border border-[#2a2c2a] rounded p-2 text-sm focus:border-green-500 focus:outline-none" placeholder="Ej: Par LED 64" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Marca</label>
                                            <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-[#121212] border border-[#2a2c2a] rounded p-2 text-sm focus:border-green-500 focus:outline-none" placeholder="Ej: Chauvet" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Cantidad Total a Ingresar</label>
                                            <input type="number" min="1" required value={formData.qtyTotal} onChange={e => setFormData({ ...formData, qtyTotal: parseInt(e.target.value) })} className="w-full bg-[#121212] border border-[#2a2c2a] rounded p-2 text-sm focus:border-green-500 focus:outline-none" />
                                        </div>
                                        <div className="flex items-end">
                                            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded p-2 text-sm transition-colors flex items-center justify-center">
                                                <Save className="w-4 h-4 mr-2" /> Guardar en Bodega
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Table */}
                            <div className="bg-[#1a1c1a] rounded-xl border border-[#2a2c2a] overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#202220] text-gray-400 text-xs uppercase font-medium border-b border-[#2a2c2a]">
                                        <tr className="[&>th]:px-6 [&>th]:py-4">
                                            <th>Asset ID</th>
                                            <th>Category</th>
                                            <th>Item Name</th>
                                            <th>Brand</th>
                                            <th>Quantity (Bodega / Total)</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2a2c2a]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <svg className="animate-spin w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                        Cargando inventario...
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (activeTab === 'existencia' ? items.filter(i => i.qtyIn > 0) : items).length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FileText className="w-12 h-12 mb-3 text-[#2a2c2a]" />
                                                        <p>{activeTab === 'existencia' ? 'No hay equipos en existencia.' : 'Tu inventario está vacío.'}</p>
                                                        {activeTab === 'inventory' && <p className="text-xs mt-1">Haz clic en "Agregar Nuevo" arriba a la derecha para empezar a registrar equipos.</p>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            (activeTab === 'existencia' ? items.filter(i => i.qtyIn > 0) : items).map((item, index) => (
                                                <tr key={index} className="hover:bg-[#252825] transition-colors [&>td]:px-6 [&>td]:py-4 text-gray-300">
                                                    <td className="font-mono text-xs">{item.id}</td>
                                                    <td>
                                                        <span className="flex items-center text-xs px-2.5 py-1 rounded bg-[#121212] border border-[#2a2c2a] w-fit">
                                                            {item.category === 'Audio' ? <Speaker className="w-3 h-3 mr-1 text-blue-400" /> :
                                                                item.category === 'Lighting' ? <Lightbulb className="w-3 h-3 mr-1 text-yellow-400" /> :
                                                                    <Monitor className="w-3 h-3 mr-1 text-green-400" />}
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="font-medium text-white">{item.name}</td>
                                                    <td>{item.brand}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium">{item.qtyIn}</span>
                                                            <span className="text-gray-500">/ {item.qtyTotal}</span>
                                                            <div className="w-16 h-1.5 bg-[#2a2c2a] rounded-full overflow-hidden ml-2 border border-[#333]">
                                                                <div className="h-full bg-green-500" style={{ width: `${(item.qtyIn / item.qtyTotal) * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {item.qtyIn > 0 ? (
                                                            <span className="flex items-center text-xs font-medium text-green-500 bg-[rgba(34,197,94,0.1)] border border-green-500/20 px-2 py-1 rounded-full w-fit">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> {item.status} ({item.qtyIn}/{item.qtyTotal})
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center text-xs font-medium text-yellow-500 bg-[rgba(234,179,8,0.1)] border border-yellow-500/20 px-2 py-1 rounded-full w-fit">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span> Fuera ({item.qtyOut}/{item.qtyTotal})
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: SALIDA / RENTA */}
                    {activeTab === 'salida' && (
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* PANEL IZQUIERDO: SELECCIÓN DE INVENTARIO */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-[#1a1c1a] p-4 rounded-xl border border-[#2a2c2a] flex justify-between items-center">
                                    <h2 className="text-white font-medium">Módulo de Salida (Nueva Renta)</h2>
                                    <div className="flex bg-[#121212] rounded-lg p-1 border border-[#2a2c2a]">
                                        <button className="px-3 py-1 bg-[#252825] text-green-500 rounded font-medium text-xs">Inventory</button>
                                        <button className="px-3 py-1 text-gray-500 hover:text-white rounded font-medium text-xs">Kits</button>
                                    </div>
                                </div>

                                <div className="bg-[#1a1c1a] rounded-xl border border-[#2a2c2a] overflow-hidden">
                                    <div className="p-4 border-b border-[#2a2c2a] bg-[#202220]">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre o ID para agregar..."
                                                className="w-full bg-[#121212] border border-[#2a2c2a] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-green-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="divide-y divide-[#2a2c2a] max-h-[500px] overflow-y-auto">
                                        {items.filter(i => i.qtyIn > 0).map(item => (
                                            <div key={item.supabaseId} className="flex items-center justify-between p-4 hover:bg-[#252825] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#121212] rounded flex items-center justify-center border border-[#2a2c2a]">
                                                        {item.category === 'Audio' ? <Speaker className="w-5 h-5 text-gray-400" /> :
                                                            item.category === 'Lighting' ? <Lightbulb className="w-5 h-5 text-gray-400" /> :
                                                                <Monitor className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.brand} • <span className="text-green-500 font-medium">Disp: {item.qtyIn}</span></p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={rentCart.some(c => c.supabaseId === item.supabaseId)}
                                                    className="w-8 h-8 rounded bg-[rgba(34,197,94,0.1)] text-green-500 hover:bg-green-500 hover:text-black flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {items.filter(i => i.qtyIn > 0).length === 0 && (
                                            <div className="p-8 text-center text-gray-500 text-sm">No hay equipos disponibles para rentar.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* PANEL DERECHO: CARRITO DE RENTA */}
                            <div className="bg-[#1a1c1a] rounded-xl border border-[#2a2c2a] flex flex-col h-fit sticky top-8">
                                <div className="p-4 border-b border-[#2a2c2a]">
                                    <h3 className="text-white font-medium text-center">Panel de Selección de Renta</h3>
                                </div>

                                {/* Lista de Carrito */}
                                <div className="p-4 flex-1 min-h-[200px] max-h-[300px] overflow-y-auto space-y-3">
                                    {rentCart.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                            <FileText className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">No has agregado equipos</p>
                                        </div>
                                    ) : (
                                        rentCart.map(cartItem => (
                                            <div key={cartItem.supabaseId} className="bg-[#121212] border border-[#2a2c2a] rounded p-3 flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm text-white font-medium line-clamp-1 pr-2">{cartItem.name}</p>
                                                    <button onClick={() => handleRemoveFromCart(cartItem.supabaseId)} className="text-gray-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">Disp: {cartItem.qtyIn}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span>Cant:</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={cartItem.qtyIn}
                                                            value={cartItem.qtyToRent}
                                                            onChange={(e) => handleUpdateCartQty(cartItem.supabaseId, parseInt(e.target.value))}
                                                            className="w-16 bg-[#1a1c1a] border border-[#2a2c2a] rounded px-2 py-1 text-white text-center focus:outline-none focus:border-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Formulario Final */}
                                <div className="p-4 bg-[#202220] border-t border-[#2a2c2a] mt-auto rounded-b-xl">
                                    <form onSubmit={handleRentSubmit} className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <label className="text-gray-400">Evento:</label>
                                            <input
                                                type="text" required
                                                value={rentForm.event} onChange={e => setRentForm({ ...rentForm, event: e.target.value })}
                                                className="w-40 bg-[#121212] border border-[#2a2c2a] rounded px-2 py-1 text-white focus:outline-none focus:border-green-500"
                                                placeholder="Ej: Concierto"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-gray-400">Cliente:</label>
                                            <input
                                                type="text" required
                                                value={rentForm.client} onChange={e => setRentForm({ ...rentForm, client: e.target.value })}
                                                className="w-40 bg-[#121212] border border-[#2a2c2a] rounded px-2 py-1 text-white focus:outline-none focus:border-green-500"
                                                placeholder="Ej: Eventos S.A."
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-gray-400">Fecha Salida:</label>
                                            <input
                                                type="date" required
                                                value={rentForm.dateOut} onChange={e => setRentForm({ ...rentForm, dateOut: e.target.value })}
                                                className="w-40 bg-[#121212] border border-[#2a2c2a] rounded px-2 py-1 text-white focus:outline-none focus:border-green-500"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-gray-400">Fecha Retorno:</label>
                                            <input
                                                type="date" required
                                                value={rentForm.dateReturn} onChange={e => setRentForm({ ...rentForm, dateReturn: e.target.value })}
                                                className="w-40 bg-[#121212] border border-[#2a2c2a] rounded px-2 py-1 text-white focus:outline-none focus:border-green-500"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={rentCart.length === 0 || loading}
                                            className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-green-900 disabled:text-gray-400 text-black font-semibold rounded-lg py-2.5 transition-colors"
                                        >
                                            {loading ? 'Procesando...' : 'Confirmar Renta (Salida)'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: RETORNO */}
                    {activeTab === 'retorno' && (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="bg-[#1a1c1a] rounded-xl border border-[#2a2c2a] overflow-hidden">
                                <div className="p-4 border-b border-[#2a2c2a] bg-[#202220] flex justify-between items-center">
                                    <h3 className="text-white font-medium flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 text-green-500 transform rotate-180" />
                                        Módulo de Retorno / Check-in
                                    </h3>
                                    <p className="text-xs text-gray-400">Solo rentas activas</p>
                                </div>
                                <div className="divide-y divide-[#2a2c2a]">
                                    {rentals.filter(r => !r.status || r.status === 'Activa').length === 0 ? (
                                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                            <CheckCircle className="w-12 h-12 mb-3 text-[#2a2c2a]" />
                                            <p>No hay rentas activas pendientes de devolución.</p>
                                        </div>
                                    ) : (
                                        rentals.filter(r => !r.status || r.status === 'Activa').map((renta, idx) => (
                                            <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#252825] transition-colors group">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-white font-medium text-lg">{renta.client}</h4>
                                                        <span className="text-xs bg-yellow-900/30 text-yellow-500 border border-yellow-700/50 px-2 py-0.5 rounded-full">Activa</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 mb-1">Evento: <span className="text-gray-300">{renta.event}</span></p>
                                                    <p className="text-xs text-gray-500 mb-3">Salida: {renta.dateOut} • Retorno esperado: {renta.dateReturn}</p>

                                                    <div className="bg-[#121212] border border-[#2a2c2a] rounded-lg p-3">
                                                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Equipos a devolver ({renta.items?.length || 0}):</p>
                                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                                                            {renta.items && renta.items.map((it, i) => (
                                                                <li key={i} className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                    <span className="font-medium text-white">{it.qty}x</span> {it.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 flex items-center justify-end">
                                                    <button
                                                        onClick={() => handleReturnRent(renta)}
                                                        className="w-full md:w-auto flex justify-center items-center gap-2 bg-[#202220] border border-[#2a2c2a] text-gray-300 hover:bg-green-500 hover:text-black hover:border-green-500 px-6 py-3 rounded-lg font-medium transition-all"
                                                    >
                                                        <RefreshCw className="w-5 h-5 transform rotate-180" />
                                                        Registrar Devolución Completa
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: RENTAS REALIZADAS */}
                    {activeTab === 'rentas' && (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="bg-[#1a1c1a] rounded-xl border border-[#2a2c2a] overflow-hidden">
                                <div className="p-4 border-b border-[#2a2c2a] bg-[#202220]">
                                    <h3 className="text-white font-medium">Historial de Rentas</h3>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#202220] text-gray-400 text-xs uppercase font-medium border-b border-[#2a2c2a]">
                                        <tr className="[&>th]:px-6 [&>th]:py-4">
                                            <th>Cliente</th>
                                            <th>Evento</th>
                                            <th>Fecha Salida</th>
                                            <th>Fecha Retorno</th>
                                            <th>Equipos Rentados</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2a2c2a]">
                                        {loadingRentals ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <svg className="animate-spin w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                        Cargando rentas...
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : rentals.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Calendar className="w-12 h-12 mb-3 text-[#2a2c2a]" />
                                                        <p>No hay rentas registradas.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            rentals.map((renta, idx) => (
                                                <tr key={idx} className="hover:bg-[#252825] transition-colors [&>td]:px-6 [&>td]:py-4 text-gray-300">
                                                    <td className="font-medium text-white">{renta.client}</td>
                                                    <td>{renta.event}</td>
                                                    <td>{renta.dateOut}</td>
                                                    <td>{renta.dateReturn}</td>
                                                    <td>
                                                        <ul className="list-disc list-inside text-xs text-gray-400">
                                                            {renta.items && renta.items.map((it, i) => (
                                                                <li key={i}>{it.qty}x {it.name}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        {renta.status === 'Devuelta' ? (
                                                            <span className="text-xs font-medium text-green-500 bg-green-900/20 border border-green-500/20 px-2 py-1 rounded-full">Devuelta</span>
                                                        ) : (
                                                            <span className="text-xs font-medium text-yellow-500 bg-yellow-900/20 border border-yellow-500/20 px-2 py-1 rounded-full">Activa</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {(!renta.status || renta.status === 'Activa') && (
                                                            <button
                                                                onClick={() => handleReturnRent(renta)}
                                                                className="text-xs bg-[#202220] border border-[#2a2c2a] text-gray-300 hover:bg-green-500 hover:text-black hover:border-green-500 px-3 py-1.5 rounded-lg transition-all"
                                                            >
                                                                Devolver
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

export default Luces;
