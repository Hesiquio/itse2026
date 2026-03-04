import React, { useState, useMemo } from 'react';
import { useModuleLogic } from './useModuleLogic';
import { Shield, Trash2, Eye, EyeOff, Plus, Copy, Check, Search, Lock, ShieldCheck } from 'lucide-react';

// --- UTILS (Generación Segura) ---
const generateSecurePassword = (length) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  const array = new Uint32Array(Number(length));
  window.crypto.getRandomValues(array);
  return Array.from(array, (val) => charset[val % charset.length]).join('');
};

const vault = {
  encrypt: (text) => btoa(encodeURIComponent(text)),
  decrypt: (cipher) => {
    try { return decodeURIComponent(atob(cipher)); } 
    catch { return "Error"; }
  }
};

function GestorDeContrasenasSimulado() {
  const { items, addData, deleteData } = useModuleLogic('GestorDeContrasenasSimulado');
  const [newEntry, setNewEntry] = useState({ servicio: '', usuario: '', password: '' });
  const [longitud, setLongitud] = useState(16);
  const [showPass, setShowPass] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => 
    items.filter(item => item.content.servicio.toLowerCase().includes(searchTerm.toLowerCase())),
    [items, searchTerm]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.servicio || !newEntry.password) return;
    addData({ ...newEntry, password: vault.encrypt(newEntry.password) });
    setNewEntry({ servicio: '', usuario: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* NAVBAR: Ancho completo pero contenido centrado */}
      <nav className="h-16 bg-white border-b sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-indigo-200 shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              Vault<span className="text-indigo-600">Secure</span>
            </span>
          </div>
          
          <div className="flex-1 max-w-2xl mx-10">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Buscar credenciales..."
                className="w-full bg-slate-100 border-transparent rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</span>
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Encriptado
                </span>
             </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-[1600px] mx-auto p-6 lg:p-10">
        <div className="flex flex-col xl:flex-row gap-10 items-start">
          
          {/* PANEL IZQUIERDO: FORMULARIO (Ancho fijo en PC) */}
          <section className="w-full xl:w-[400px] sticky top-28">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
              <h2 className="text-xl font-extrabold mb-8 flex items-center gap-3">
                <Plus className="text-indigo-600 bg-indigo-50 p-1 rounded-lg" size={28} />
                Agregar Cuenta
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">NOMBRE DEL SERVICIO</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="Ej. Amazon, Dropbox..."
                    value={newEntry.servicio}
                    onChange={e => setNewEntry({...newEntry, servicio: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">USUARIO / EMAIL</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="usuario@ejemplo.com"
                    value={newEntry.usuario}
                    onChange={e => setNewEntry({...newEntry, usuario: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 ml-1">CONTRASEÑA SEGURA</label>
                    <button 
                      type="button" 
                      onClick={() => setNewEntry({...newEntry, password: generateSecurePassword(longitud)})}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4"
                    >
                      Generar
                    </button>
                  </div>
                  <input 
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={newEntry.password}
                    onChange={e => setNewEntry({...newEntry, password: e.target.value})}
                  />
                  <div className="px-1">
                    <input 
                      type="range" min="8" max="32" 
                      value={longitud} 
                      onChange={e => setLongitud(e.target.value)}
                      className="w-full h-2 accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                      <span>LONGITUD: {longitud}</span>
                      <span className={longitud > 15 ? "text-green-500" : "text-orange-500"}>
                        {longitud > 15 ? 'FUERTE' : 'MEDIA'}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transform hover:-translate-y-1 transition-all shadow-lg active:scale-95">
                  Guardar en Bóveda
                </button>
              </form>
            </div>
          </section>

          {/* PANEL DERECHO: GRID DE CUENTAS */}
          <section className="flex-1 w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mis Credenciales</h2>
                <p className="text-slate-500 text-sm">Gestiona tus accesos de forma segura</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border text-sm font-bold text-slate-600 shadow-sm">
                Total: {filteredItems.length}
              </div>
            </div>

            {/* Grid dinámico: 1 col en móvil, 2 en laptop, 3 en 1920x1080 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const decrypted = vault.decrypt(item.content.password);
                return (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-[1.5rem] p-6 hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${item.content.servicio.toLowerCase().replace(/\s+/g, '')}.com&sz=128`} 
                          className="w-8 h-8 object-contain"
                          onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${item.content.servicio}&background=6366f1&color=fff`}
                          alt=""
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 truncate text-lg">{item.content.servicio}</h3>
                        <p className="text-xs text-slate-500 truncate mb-4">{item.content.usuario}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between group/pass">
                          <code className="text-xs font-mono text-indigo-600 font-bold tracking-wider">
                            {showPass[item.id] ? decrypted : '••••••••••••'}
                          </code>
                          <button 
                            onClick={() => setShowPass(p => ({...p, [item.id]: !p[item.id]}))}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {showPass[item.id] ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 border-t pt-4">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(decrypted);
                          setCopiedId(item.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${copiedId === item.id ? 'bg-green-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'}`}
                      >
                        {copiedId === item.id ? <><Check size={14}/> Copiado</> : <><Copy size={14}/> Copiar</>}
                      </button>
                      
                      <button 
                        onClick={() => deleteData(item.id)}
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="bg-slate-50 p-6 rounded-full mb-4 text-slate-300"><Lock size={48}/></div>
                <h3 className="font-bold text-slate-800">Bóveda vacía</h3>
                <p className="text-slate-500 text-sm">No hay registros que coincidan con tu búsqueda.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default GestorDeContrasenasSimulado;