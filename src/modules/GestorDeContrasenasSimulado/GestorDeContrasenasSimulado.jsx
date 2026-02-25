import React, { useState, useEffect } from 'react';
import { useModuleLogic } from './useModuleLogic';
import { Shield, Trash2, Eye, EyeOff, Plus, Copy, Check, Lock, Key } from 'lucide-react';
import CryptoJS from 'crypto-js';

const SECRET_KEY = "itse_escarcega_2026_security_key";

function GestorDeContrasenasSimulado() {
  const { items, loading, addData, deleteData } = useModuleLogic('GestorDeContrasenasSimulado');
  
  const [newEntry, setNewEntry] = useState({ servicio: '', usuario: '', password: '' });
  const [longitud, setLongitud] = useState(12); // Estado para la barra de longitud
  const [showPass, setShowPass] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // --- LÓGICA DE GENERACIÓN Y SEGURIDAD ---

  const generarPass = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < longitud; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewEntry({ ...newEntry, password: password });
  };

  // Evalúa la fuerza de la contraseña (0 a 100)
  const calcularFuerza = (pass) => {
    if (!pass) return 0;
    let fuerza = 0;
    if (pass.length > 8) fuerza += 25;
    if (pass.length > 12) fuerza += 25;
    if (/[A-Z]/.test(pass)) fuerza += 25;
    if (/[!@#$%^&*()_+]/.test(pass)) fuerza += 25;
    return fuerza;
  };

  const fuerzaColor = () => {
    const score = calcularFuerza(newEntry.password);
    if (score <= 25) return 'bg-red-500';
    if (score <= 50) return 'bg-orange-500';
    if (score <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.servicio || !newEntry.password) return alert("Llena los campos");

    const encryptedPassword = CryptoJS.AES.encrypt(newEntry.password, SECRET_KEY).toString();
    addData({ ...newEntry, password: encryptedPassword });
    setNewEntry({ servicio: '', usuario: '', password: '' });
  };

  const descifrarPassword = (cipherText) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) { return "Error"; }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen font-sans">
      <header className="flex items-center gap-3 mb-8 border-b pb-4">
        <div className="bg-blue-600 p-2 rounded-xl text-white">
          <Shield size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Caja Fuerte Digital</h1>
          <p className="text-xs text-gray-400 font-medium">ITSE 2026 - Cifrado AES-256</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-3xl border shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input 
              placeholder="Nombre del Servicio (ej: Facebook)"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={newEntry.servicio}
              onChange={e => setNewEntry({...newEntry, servicio: e.target.value})}
            />
            <input 
              placeholder="Usuario o Correo"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={newEntry.usuario}
              onChange={e => setNewEntry({...newEntry, usuario: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400 uppercase">Longitud: {longitud}</label>
              <span onClick={generarPass} className="text-xs italic text-blue-600 cursor-pointer hover:underline">
                ¿Generar contraseña segura?
              </span>
            </div>
            
            {/* BARRA DE LONGITUD */}
            <input 
              type="range" min="6" max="16" step="1"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <input 
              type="text" 
              placeholder="Contraseña"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white"
              value={newEntry.password}
              onChange={e => setNewEntry({...newEntry, password: e.target.value})}
            />

            {/* MEDIDOR DE FUERZA */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${fuerzaColor()}`} 
                style={{ width: `${calcularFuerza(newEntry.password)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button type="submit" className="mt-6 w-full bg-blue-600 text-white p-4 rounded-2xl font-bold flex justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
          <Plus size={20} /> Guardar con Cifrado AES
        </button>
      </form>

      {/* LISTA DE CONTRASEÑAS */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">Cuentas Almacenadas</h2>
        {items.map((item) => {
          const domain = item.content.servicio.toLowerCase().replace(/\s+/g, '') + ".com";
          return (
            <div key={item.id} className="flex items-center justify-between p-5 border rounded-3xl hover:shadow-md transition-all bg-white group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl border bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`} 
                    alt="" className="w-7 h-7 object-contain"
                    onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/2092/2092663.png"; }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none">{item.content.servicio}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.content.usuario}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="mr-4 hidden md:block text-right">
                   <p className="font-mono text-sm text-gray-300">
                     {showPass[item.id] ? descifrarPassword(item.content.password) : '••••••••••••'}
                   </p>
                </div>
                <button onClick={() => setShowPass({...showPass, [item.id]: !showPass[item.id]})} className="p-2 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600"><Eye size={20}/></button>
                <button onClick={() => {
                  const p = descifrarPassword(item.content.password);
                  navigator.clipboard.writeText(p);
                  setCopiedId(item.id);
                  setTimeout(()=>setCopiedId(null), 2000);
                }} className="p-2 hover:bg-green-50 rounded-xl text-gray-400 hover:text-green-600">
                  {copiedId === item.id ? <Check size={20}/> : <Copy size={20}/>}
                </button>
                <button onClick={() => deleteData(item.id)} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600"><Trash2 size={20}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GestorDeContrasenasSimulado;