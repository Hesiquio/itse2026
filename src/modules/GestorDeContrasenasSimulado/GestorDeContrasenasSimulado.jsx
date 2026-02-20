import React, { useState } from 'react';
import { useModuleLogic } from './useModuleLogic';
import { Shield, Trash2, Eye, EyeOff, Plus, Copy, Check, Lock } from 'lucide-react';
import CryptoJS from 'crypto-js';

// Clave secreta para cifrar (en un proyecto real usarías variables de entorno .env)
const SECRET_KEY = "itse_escarcega_2026_security_key";

function GestorDeContrasenasSimulado() {
  const { items, loading, addData, deleteData } = useModuleLogic('GestorDeContrasenasSimulado');
  
  const [newEntry, setNewEntry] = useState({ servicio: '', usuario: '', password: '' });
  const [showPass, setShowPass] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // --- LÓGICA DE SEGURIDAD ---

  const generarPass = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    // Al hacer clic en el texto, se actualiza el campo automáticamente
    setNewEntry({ ...newEntry, password: password });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.servicio || !newEntry.password) return alert("Llena los campos");

    // CIFRADO: Antes de enviar a Supabase, convertimos la contraseña en un hash ilegible
    const encryptedPassword = CryptoJS.AES.encrypt(newEntry.password, SECRET_KEY).toString();
    
    const dataToSave = {
      ...newEntry,
      password: encryptedPassword
    };

    addData(dataToSave);
    setNewEntry({ servicio: '', usuario: '', password: '' });
  };

  const descifrarPassword = (cipherText) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return "Error de cifrado";
    }
  };

  const copiarPortapapeles = (textoCifrado, id) => {
    const textoClaro = descifrarPassword(textoCifrado);
    navigator.clipboard.writeText(textoClaro);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <header className="flex items-center gap-3 mb-8 border-b pb-4">
        <Shield className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">PassMan</h1>
      </header>

      {/* Formulario con Generador Interactivo */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border mb-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            placeholder="Servicio (ej: Google, Netflix)"
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={newEntry.servicio}
            onChange={e => setNewEntry({...newEntry, servicio: e.target.value})}
          />
          <input 
            placeholder="Usuario / Correo"
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={newEntry.usuario}
            onChange={e => setNewEntry({...newEntry, usuario: e.target.value})}
          />
          
          <div className="md:col-span-2">
            <div className="flex justify-between mb-1 px-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Contraseña</label>
              <span 
                onClick={generarPass}
                className="text-xs italic text-blue-600 cursor-pointer hover:underline select-none"
              >
                ¿Generar contraseña segura?
              </span>
            </div>
            <input 
              type="text" 
              placeholder="Contraseña"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              value={newEntry.password}
              onChange={e => setNewEntry({...newEntry, password: e.target.value})}
            />
          </div>
        </div>
        <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center gap-2 hover:bg-blue-700 transition-all">
          <Plus size={20} /> Guardar Credenciales
        </button>
      </form>

      {/* Lista Estilo Google con Iconos Automáticos */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase ml-2">Tus cuentas cifradas</h2>
        {items.map((item) => {
          // Lógica de iconos automáticos basada en el nombre del servicio
          const domain = item.content.servicio.toLowerCase().replace(/\s+/g, '') + ".com";
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

          return (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-2xl hover:bg-gray-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={faviconUrl} 
                    alt="logo" 
                    className="w-7 h-7 object-contain"
                    onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/2092/2092663.png"; }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.content.servicio}</h3>
                  <p className="text-sm text-gray-500">{item.content.usuario}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400 font-mono">
                    {showPass[item.id] ? descifrarPassword(item.content.password) : '••••••••••••'}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => setShowPass({...showPass, [item.id]: !showPass[item.id]})} className="p-2 text-gray-400 hover:text-blue-600"><Eye size={18} /></button>
                  <button onClick={() => copiarPortapapeles(item.content.password, item.id)} className="p-2 text-gray-400 hover:text-green-600">
                    {copiedId === item.id ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                  <button onClick={() => deleteData(item.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GestorDeContrasenasSimulado;