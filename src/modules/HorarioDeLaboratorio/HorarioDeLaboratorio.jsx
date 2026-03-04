import { useState } from 'react';
import { Link } from 'react-router-dom';
import ModuleTemplate from '../../components/ModuleTemplate';

// horarios válidos en toda la aplicación
const MIN_TIME = '07:00';
const MAX_TIME = '21:00';

const fields = [
  { name: 'laboratorio', label: 'Laboratorio', type: 'text', required: true },
  { name: 'dia', label: 'Fecha', type: 'date', required: true },
  { name: 'hora_inicio', label: 'Hora Inicio', type: 'time', required: true, min: MIN_TIME, max: MAX_TIME },
  { name: 'hora_fin', label: 'Hora Fin', type: 'time', required: true, min: MIN_TIME, max: MAX_TIME },
  { name: 'actividad', label: 'Actividad', type: 'text', required: true },
  // nueva casilla para el salón
  { name: 'salon', label: 'Salón', type: 'text', required: true },
];

function HorarioDeLaboratorio() {
  // validación específica para rango de horarios y choques
  const validate = (data, editingItem) => {
    // verificar rango permitido
    if (data.hora_inicio && (data.hora_inicio < MIN_TIME || data.hora_inicio > MAX_TIME)) {
      return `La hora de inicio debe estar entre ${MIN_TIME} y ${MAX_TIME}.`;
    }
    if (data.hora_fin && (data.hora_fin < MIN_TIME || data.hora_fin > MAX_TIME)) {
      return `La hora de fin debe estar entre ${MIN_TIME} y ${MAX_TIME}.`;
    }

    if (data.hora_inicio && data.hora_fin && data.hora_inicio >= data.hora_fin) {
      return 'La hora de fin debe ser posterior a la hora de inicio.';
    }
    // chequeo de día repetido o solapado
    const sameDay = allItems.filter(i => i.content.dia === data.dia && i.id !== (editingItem?.id));
    if (sameDay.length > 0) {
      // opcional: prohibir día repetido completamente
      //return 'Ya existe un registro para ese día.';
      // chequeo de solapamiento de horarios
      for (let i of sameDay) {
        // si no se separan (fin <= inicio existente o inicio >= fin existente) hay choque
        if (!(data.hora_fin <= i.content.hora_inicio || data.hora_inicio >= i.content.hora_fin)) {
          return 'El horario se solapa con otro registro existente en ese día.';
        }
      }
    }
    return null;
  };

  // colormap de días para dar color a cada registro
  const dayColors = {
    Lunes: 'bg-red-100 text-red-800',
    Martes: 'bg-green-100 text-green-800',
    Miércoles: 'bg-yellow-100 text-yellow-800',
    Jueves: 'bg-blue-100 text-blue-800',
    Viernes: 'bg-indigo-100 text-indigo-800',
    Sábado: 'bg-purple-100 text-purple-800',
  };

  const renderHorarioItem = (item) => {
    const dia = item.content.dia;
    const colorClass = dayColors[dia] || 'bg-gray-100 text-gray-800';
    return (
      <div className="mb-2">
        <div className={`inline-block px-2 py-1 rounded ${colorClass} font-semibold`}>{dia}</div>
        <div>Laboratorio: {item.content.laboratorio}</div>
        <div>Horario: {item.content.hora_inicio} – {item.content.hora_fin}</div>
        <div>Actividad: {item.content.actividad}</div>
        <div>Salón: {item.content.salon}</div>
      </div>
    );
  };

  // mantenemos copia de todos los registros para otros usos (export, etc.)
  const [allItems, setAllItems] = useState([]);

  // cuando ModuleTemplate actualiza, guardamos copia
  const handleItemsUpdate = (items) => {
    setAllItems(items);
  };

  // la lógica de disponibilidad se ha movido a su propia página

  return (
    <>

      {/* barra de utilidades con export y enlace a disponibilidad */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => {
            // exportar usando allItems y fields
            if (!(allItems && allItems.length)) return;
            const headers = fields.map(f => f.label);
            const rows = allItems.map(i => fields.map(f => {
              const cell = i.content[f.name];
              return typeof cell === 'string' ? `"${cell.replace(/"/g,'""')}"` : cell;
            }).join(','));
            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'HorarioLaboratorio.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center shadow text-sm transition-colors"
        >
          📄 Exportar CSV
        </button>
        <Link
          to="/horario-de-laboratorio/disponibilidad"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg shadow transition text-sm"
        >
          Ver disponibilidad
        </Link>
      </div>
      <ModuleTemplate
        moduleName="Horario de Laboratorio"
        moduleOwner="HorarioDeLaboratorio"
        fields={fields}
        validateContent={validate}
        renderItem={renderHorarioItem}
        headerClassName="text-white bg-gradient-to-r from-blue-500 to-purple-600"
        onItemsUpdate={handleItemsUpdate}
      />
    </>
  );
}

export default HorarioDeLaboratorio;
