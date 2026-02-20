import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'laboratorio', label: 'Laboratorio', type: 'text', required: true },
  { name: 'dia', label: 'Día', type: 'select', options: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], required: true },
  { name: 'hora_inicio', label: 'Hora Inicio', type: 'time', required: true },
  { name: 'hora_fin', label: 'Hora Fin', type: 'time', required: true },
  { name: 'actividad', label: 'Actividad', type: 'text', required: true },
];

function HorarioDeLaboratorio() {
  return (
    <ModuleTemplate
      moduleName="Horario de Laboratorio"
      moduleOwner="HorarioDeLaboratorio"
      fields={fields}
    />
  );
}

export default HorarioDeLaboratorio;
