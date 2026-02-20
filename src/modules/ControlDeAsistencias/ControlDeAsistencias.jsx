import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'materia', label: 'Materia', type: 'text', required: true },
  { name: 'fecha', label: 'Fecha', type: 'date', required: true },
  { name: 'estado', label: 'Estado', type: 'select', options: ['Asistió', 'Falta', 'Retardo'], required: true },
  { name: 'notas', label: 'Notas', type: 'textarea', required: false },
];

function ControlDeAsistencias() {
  return (
    <ModuleTemplate
      moduleName="Control de Asistencias by @LuisPatMtz"
      moduleOwner="ControlDeAsistencias"
      fields={fields}
    />
  );
}

export default ControlDeAsistencias;
