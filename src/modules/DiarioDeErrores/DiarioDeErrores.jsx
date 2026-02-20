import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'titulo', label: 'Título del Error', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción del Error', type: 'textarea', required: true },
  { name: 'solucion', label: 'Solución', type: 'textarea', required: false },
  { name: 'fecha', label: 'Fecha', type: 'date', required: true },
  { name: 'proyecto', label: 'Proyecto', type: 'text', required: false },
];

function DiarioDeErrores() {
  return (
    <ModuleTemplate
      moduleName="Diario de Errores"
      moduleOwner="DiarioDeErrores"
      fields={fields}
    />
  );
}

export default DiarioDeErrores;
