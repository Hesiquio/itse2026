import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'fecha', label: 'Fecha', type: 'date', required: true },
  { name: 'tutor', label: 'Tutor', type: 'text', required: true },
  { name: 'tema', label: 'Tema', type: 'text', required: true },
  { name: 'duracion', label: 'Duración (minutos)', type: 'number', required: true },
  { name: 'notas', label: 'Notas', type: 'textarea', required: false },
];

function BitacoraDeTutorias() {
  return (
    <ModuleTemplate
      moduleName="Bitácora de Tutorías"
      moduleOwner="BitacoraDeTutorias"
      fields={fields}
    />
  );
}

export default BitacoraDeTutorias;
