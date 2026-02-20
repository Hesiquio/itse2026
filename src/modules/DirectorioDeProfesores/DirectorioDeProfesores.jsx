import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'materia', label: 'Materia', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
  { name: 'oficina', label: 'Oficina', type: 'text', required: false },
];

function DirectorioDeProfesores() {
  return (
    <ModuleTemplate
      moduleName="Directorio de Profesores"
      moduleOwner="DirectorioDeProfesores"
      fields={fields}
    />
  );
}

export default DirectorioDeProfesores;
