import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'concepto', label: 'Concepto', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'imagen', label: 'Imagen', type: 'file', accept: 'image/*', required: false },
  { name: 'enlace', label: 'Enlace', type: 'url', required: true },
];

function RepositorioDeEnlaces() {
  return (
    <ModuleTemplate
      moduleName="Repositorio de Enlaces"
      moduleOwner="RepositorioDeEnlaces"
      fields={fields}
    />
  );
}

export default RepositorioDeEnlaces;
