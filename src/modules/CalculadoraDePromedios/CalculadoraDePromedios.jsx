import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'materia', label: 'Materia', type: 'text', required: true },
  { name: 'calificacion', label: 'Calificación', type: 'number', required: true },
  { name: 'creditos', label: 'Créditos', type: 'number', required: true },
  { name: 'periodo', label: 'Periodo', type: 'text', required: true },
];

function CalculadoraDePromedios() {
  return (
    <ModuleTemplate
      moduleName="Calculadora de Promedios"
      moduleOwner="CalculadoraDePromedios"
      fields={fields}
    />
  );
}

export default CalculadoraDePromedios;
