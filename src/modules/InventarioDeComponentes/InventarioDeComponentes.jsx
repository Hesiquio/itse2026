import { useState } from "react";

export default function App() {

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [componentes, setComponentes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [formData, setFormData] = useState({
    componente: "",
    cantidad: "",
    ubicacion: "",
    especificaciones: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const guardarComponente = (e) => {
    e.preventDefault();

    setComponentes([...componentes, formData]);

    setFormData({
      componente: "",
      cantidad: "",
      ubicacion: "",
      especificaciones: ""
    });

    setMostrarFormulario(false);
  };

  const eliminarComponente = (index) => {
    const nuevosComponentes = componentes.filter((_, i) => i !== index);
    setComponentes(nuevosComponentes);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">

      <div className="w-full max-w-5xl">

        {/* TITULO MEJORADO */}
        <div className="text-center mb-10">

          <h1 className="text-3xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            📦 Inventario de Componentes
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Registro y control de los componentes del sistema
          </p>

        </div>

        {/* BOTON AGREGAR */}
        {!mostrarFormulario && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 px-6 py-3 
              bg-green-500 text-white font-medium
              rounded-lg shadow-lg 
              hover:bg-green-600 
              hover:scale-105
              transition duration-300"
            >
              <span className="text-lg font-bold text-white">+</span>
              Agregar Nuevo
            </button>
          </div>
        )}

        {/* ESTADO VACIO BONITO */}
        {!mostrarFormulario && componentes.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6">

            <div className="text-5xl mb-4">
              📦
            </div>

            <h2 className="text-xl font-semibold text-gray-700">
              No hay componentes registrados
            </h2>

            <p className="text-gray-500 mt-2">
              Comienza agregando tu primer componente al inventario.
            </p>

          </div>
        )}

        {/* FORMULARIO (TU SEGUNDA VENTANA ORIGINAL) */}
        {mostrarFormulario && (
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-8 mb-6">

            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              📦 Nuevo Componente
            </h2>

            <div className="w-full h-px bg-gray-200 mb-6"></div>

            <form onSubmit={guardarComponente}>

              <div className="grid grid-cols-2 gap-6">

                <div>
                  <label className="block text-gray-700 mb-2">
                    🔧 Componente *
                  </label>
                  <input
                    type="text"
                    name="componente"
                    placeholder="Ej: Arduino Uno"
                    value={formData.componente}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2
                    focus:ring-2 focus:ring-green-400
                    focus:border-green-400
                    transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    🔢 Cantidad *
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    placeholder="Ej: 10"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2
                    focus:ring-2 focus:ring-green-400
                    focus:border-green-400
                    transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    📍 Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    placeholder="Ej: Laboratorio A"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2
                    focus:ring-2 focus:ring-green-400
                    focus:border-green-400
                    transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    📄 Especificaciones
                  </label>
                  <input
                    type="text"
                    name="especificaciones"
                    placeholder="Ej: Microcontrolador ATmega328"
                    value={formData.especificaciones}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2
                    focus:ring-2 focus:ring-green-400
                    focus:border-green-400
                    transition"
                  />
                </div>

              </div>

              <div className="flex justify-center gap-4 mt-8">

                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 hover:scale-105 transition"
                >
                  Guardar
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 hover:scale-105 transition"
                >
                  Cancelar
                </button>

              </div>

            </form>
          </div>
        )}

        {/* TABLA */}
        {componentes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">

            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Componentes Registrados
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Total de componentes: {componentes.length}
            </p>

            <input
              type="text"
              placeholder="Buscar componente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full mb-4 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
            />

            <table className="w-full text-left border-collapse">

              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-2">Componente</th>
                  <th className="px-2">Cantidad</th>
                  <th className="px-2">Ubicación</th>
                  <th className="px-2">Especificaciones</th>
                  <th className="px-2">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {componentes
                  .filter((comp) =>
                    comp.componente.toLowerCase().includes(busqueda.toLowerCase())
                  )
                  .map((comp, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition">

                      <td className="py-2 px-2">{comp.componente}</td>
                      <td className="px-2">{comp.cantidad}</td>
                      <td className="px-2">{comp.ubicacion}</td>
                      <td className="px-2">{comp.especificaciones}</td>

                      <td className="flex gap-2 py-2 px-2">

                        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition">
                          Editar
                        </button>

                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition"
                          onClick={() => eliminarComponente(index)}
                        >
                          Eliminar
                        </button>

                      </td>

                    </tr>
                  ))}
              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}