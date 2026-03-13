import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { CheckCircle, XCircle, Clock, TrendingUp, Filter, X } from 'lucide-react';

export default function DashboardEstadisticas() {
  const [horario, setHorario] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    materia: '',
    asistencia: '',
    fechaInicio: '',
    fechaFin: ''
  });
  
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);

  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    asistencias: 0,
    faltas: 0,
    retardos: 0,
    porcentajeAsistencia: 0,
    porcentajeFaltas: 0,
    porcentajeRetardos: 0,
    porActividad: {}
  });

  // Cargar materias disponibles
  useEffect(() => {
    async function cargarMaterias() {
      const { data, error } = await supabase
        .from('student_modules')
        .select('content->materia')
        .eq('module_owner', 'ControlDeAsistencias_schedule')
        .not('content->materia', 'is', null);
      
      if (!error && data) {
        const materias = [...new Set(data.map(r => r.content?.materia).filter(Boolean))].sort();
        setMateriasDisponibles(materias);
      }
    }
    cargarMaterias();
  }, []);

  // Cargar datos con filtros
  useEffect(() => {
    async function fetchHorario() {
      setLoading(true);
      let query = supabase
        .from('student_modules')
        .select('content')
        .eq('module_owner', 'ControlDeAsistencias_schedule')
        .not('content->asistencia', 'is', null);

      // Filtro por materia
      if (filtros.materia) {
        query = query.eq('content->materia', filtros.materia);
      }

      // Filtro por tipo de asistencia
      if (filtros.asistencia) {
        query = query.eq('content->asistencia', filtros.asistencia);
      }

      // Filtro por fecha inicio
      if (filtros.fechaInicio) {
        query = query.gte('content->fecha', filtros.fechaInicio);
      }

      // Filtro por fecha fin
      if (filtros.fechaFin) {
        query = query.lte('content->fecha', filtros.fechaFin);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        const registrosValidos = data.filter(r => 
          r.content && r.content.asistencia && ['Asistió', 'Falta', 'Retardo'].includes(r.content.asistencia)
        );
        setHorario(registrosValidos);
        calcularEstadisticas(registrosValidos);
      }
      setLoading(false);
    }
    fetchHorario();
  }, [filtros]);

  const calcularEstadisticas = (datos) => {
    let asistencias = 0;
    let faltas = 0;
    let retardos = 0;
    const porActividad = {};

    datos.forEach(evento => {
      const materia = evento.content.materia;
      const asistencia = evento.content.asistencia || 'No registrada';

      // Inicializar contador por actividad
      if (!porActividad[materia]) {
        porActividad[materia] = {
          total: 0,
          asistencias: 0,
          faltas: 0,
          retardos: 0
        };
      }

      porActividad[materia].total++;

      if (asistencia === 'Asistió') {
        asistencias++;
        porActividad[materia].asistencias++;
      } else if (asistencia === 'Falta') {
        faltas++;
        porActividad[materia].faltas++;
      } else if (asistencia === 'Retardo') {
        retardos++;
        porActividad[materia].retardos++;
      }
    });

    const total = asistencias + faltas + retardos;
    const porcentajeAsistencia = total > 0 ? Math.round((asistencias / total) * 100) : 0;
    const porcentajeFaltas = total > 0 ? Math.round((faltas / total) * 100) : 0;
    const porcentajeRetardos = total > 0 ? Math.round((retardos / total) * 100) : 0;

    setEstadisticas({
      total,
      asistencias,
      faltas,
      retardos,
      porcentajeAsistencia,
      porcentajeFaltas,
      porcentajeRetardos,
      porActividad
    });
  };

  const TarjetaEstadistica = ({ titulo, valor, porcentaje, icon: Icon, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{titulo}</p>
          <p className="text-3xl font-bold text-gray-800">{valor}</p>
          <p className={`text-sm font-semibold mt-2 ${color.replace('border', 'text')}`}>
            {porcentaje}%
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('l-4', '')}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const limpiarFiltros = () => {
    setFiltros({
      materia: '',
      asistencia: '',
      fechaInicio: '',
      fechaFin: ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Panel de Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtros
          </h3>
          {(filtros.materia || filtros.asistencia || filtros.fechaInicio || filtros.fechaFin) && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              <X className="w-4 h-4" /> Limpiar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro Materia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
            <select
              value={filtros.materia}
              onChange={(e) => setFiltros({ ...filtros, materia: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las materias</option>
              {materiasDisponibles.map((materia) => (
                <option key={materia} value={materia}>
                  {materia}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Asistencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtros.asistencia}
              onChange={(e) => setFiltros({ ...filtros, asistencia: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="Asistió">Asistió</option>
              <option value="Falta">Falta</option>
              <option value="Retardo">Retardo</option>
            </select>
          </div>

          {/* Filtro Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
          <p className="text-blue-700 font-medium">Cargando datos...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Tarjetas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TarjetaEstadistica
              titulo="Total de Eventos"
              valor={estadisticas.total}
              porcentaje="100"
              icon={TrendingUp}
              color="border-blue-500 bg-blue-50"
            />
            <TarjetaEstadistica
              titulo="Asistencias"
              valor={estadisticas.asistencias}
              porcentaje={estadisticas.porcentajeAsistencia}
              icon={CheckCircle}
              color="border-green-500 bg-green-50"
            />
            <TarjetaEstadistica
              titulo="Faltas"
              valor={estadisticas.faltas}
              porcentaje={estadisticas.porcentajeFaltas}
              icon={XCircle}
              color="border-red-500 bg-red-50"
            />
            <TarjetaEstadistica
              titulo="Retardos"
              valor={estadisticas.retardos}
              porcentaje={estadisticas.porcentajeRetardos}
              icon={Clock}
              color="border-yellow-500 bg-yellow-50"
            />
          </div>

          {/* Gráfico de barras simple */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Proporción de Asistencia</h3>
        <div className="flex items-end justify-center gap-8 h-64">
          {/* Barra de Asistencias */}
          <div className="flex flex-col items-center">
            <div
              className="bg-green-500 rounded-t-lg transition-all duration-500 hover:bg-green-600"
              style={{
                width: '60px',
                height: `${Math.max(estadisticas.porcentajeAsistencia * 2, 20)}px`
              }}
            />
            <p className="mt-4 font-semibold text-gray-700">{estadisticas.porcentajeAsistencia}%</p>
            <p className="text-sm text-gray-500">Asistencias</p>
          </div>

          {/* Barra de Faltas */}
          <div className="flex flex-col items-center">
            <div
              className="bg-red-500 rounded-t-lg transition-all duration-500 hover:bg-red-600"
              style={{
                width: '60px',
                height: `${Math.max(estadisticas.porcentajeFaltas * 2, 20)}px`
              }}
            />
            <p className="mt-4 font-semibold text-gray-700">{estadisticas.porcentajeFaltas}%</p>
            <p className="text-sm text-gray-500">Faltas</p>
          </div>

          {/* Barra de Retardos */}
          <div className="flex flex-col items-center">
            <div
              className="bg-yellow-500 rounded-t-lg transition-all duration-500 hover:bg-yellow-600"
              style={{
                width: '60px',
                height: `${Math.max(estadisticas.porcentajeRetardos * 2, 20)}px`
              }}
            />
            <p className="mt-4 font-semibold text-gray-700">{estadisticas.porcentajeRetardos}%</p>
            <p className="text-sm text-gray-500">Retardos</p>
          </div>
        </div>
      </div>

      {/* Estadísticas por actividad */}
      {Object.keys(estadisticas.porActividad).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Por Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(estadisticas.porActividad).map(([materia, datos]) => (
              <div key={materia} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-800 mb-3 truncate">{materia}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Asistencias:</span>
                    <span className="text-gray-800 font-bold">{datos.asistencias}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600 font-medium">Faltas:</span>
                    <span className="text-gray-800 font-bold">{datos.faltas}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600 font-medium">Retardos:</span>
                    <span className="text-gray-800 font-bold">{datos.retardos}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 mt-2">
                    <span className="text-gray-700 font-medium">Total:</span>
                    <span className="text-gray-800 font-bold">{datos.total}</span>
                  </div>
                  <div className="mt-3 bg-blue-100 rounded p-2">
                    <p className="text-xs text-blue-800 font-semibold">
                      Asistencia: {datos.total > 0 ? Math.round((datos.asistencias / datos.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {estadisticas.total === 0 && (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 text-lg">
            No hay eventos registrados. Agrega un horario para ver estadísticas.
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
