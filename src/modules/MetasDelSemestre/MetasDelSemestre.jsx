import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'meta', label: 'Meta', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'fecha_limite', label: 'Fecha Límite', type: 'date', required: true },
  { name: 'progreso', label: 'Progreso', type: 'select', options: ['0%', '25%', '50%', '75%', '100%'], required: true },
];

function MetasDelSemestre() {
  return (
    <ModuleTemplate
      moduleName="Metas del Semestre"
      moduleOwner="MetasDelSemestre"
      fields={fields}
    />
  );
}

export default MetasDelSemestre;
