import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'url', label: 'URL', type: 'url', required: true },
  { name: 'categoria', label: 'Categoría', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
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
