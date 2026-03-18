const fs = require('fs');
let c = fs.readFileSync('src/modules/Luces/Luces.jsx', 'utf8');

const returnPlaceholderStart = "{/* TAB: RETORNO */}";
const returnPlaceholderEnd = "                    {/* TAB: RENTAS REALIZADAS */}";

const currentReturnSection = c.substring(c.indexOf(returnPlaceholderStart), c.indexOf(returnPlaceholderEnd));

const newReturnUI = `                    {/* TAB: RETORNO */}
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
`

c = c.replace(currentReturnSection, newReturnUI);

// Fix table headers
c = c.replace("<th>Equipos Rentados</th><th>Estado</th><th>Acciones</th>", `<th>Equipos Rentados</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>`);

// Add Devuelta status and Acciones column to the map
const tableItemRowsOld = `<ul className="list-disc list-inside text-xs text-gray-400">
                                                            {renta.items && renta.items.map((it, i) => (
                                                                <li key={i}>{it.qty}x {it.name}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>`;

const tableItemRowsNew = `<ul className="list-disc list-inside text-xs text-gray-400">
                                                            {renta.items && renta.items.map((it, i) => (
                                                                <li key={i}>{it.qty}x {it.name}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        <span className={\`text-xs px-2 py-1 rounded-full border \${renta.status === 'Devuelta' ? 'bg-gray-800/50 text-gray-400 border-gray-600' : 'bg-green-900/30 text-green-400 border-green-700/50'}\`}>
                                                            {renta.status || 'Activa'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {(!renta.status || renta.status === 'Activa') ? (
                                                            <button 
                                                                onClick={() => handleReturnRent(renta)}
                                                                className="text-xs bg-[#202220] hover:bg-green-600 hover:text-black border border-[#2a2c2a] text-gray-300 px-3 py-1.5 rounded transition-colors"
                                                            >
                                                                Devolver todo
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-600">Completado</span>
                                                        )}
                                                    </td>
                                                </tr>`;

c = c.replace(tableItemRowsOld, tableItemRowsNew);

fs.writeFileSync('src/modules/Luces/Luces.jsx', c);
