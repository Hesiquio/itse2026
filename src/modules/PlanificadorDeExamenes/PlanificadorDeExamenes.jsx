import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'materia', label: 'Materia', type: 'text', required: true },
  { name: 'tipo', label: 'Tipo', type: 'select', options: ['Parcial', 'Final', 'Quiz', 'Práctica'], required: true },
  { name: 'fecha', label: 'Fecha', type: 'date', required: true },
  { name: 'hora', label: 'Hora', type: 'time', required: true },
  { name: 'temas', label: 'Temas a Estudiar', type: 'textarea', required: false },
];

function PlanificadorDeExamenes() {
  return (
    <ModuleTemplate
      moduleName="Planificador de Exámenes"
      moduleOwner="PlanificadorDeExamenes"
      fields={fields}
    />
  );
}

export default PlanificadorDeExamenes;
