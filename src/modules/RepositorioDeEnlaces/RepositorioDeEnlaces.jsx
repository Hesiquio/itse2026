import ModuleTemplate from '../../components/ModuleTemplate';
import './styles.css';

const fields = [
  { name: 'concepto', label: 'Concepto', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'imagen', label: 'Imagen', type: 'file', accept: 'image/*', required: false },
  { name: 'enlace', label: 'Enlace', type: 'url', required: true },
];

function RepositorioDeEnlaces() {
  return (
    <div className="repo-enlaces-wrapper">
      <ModuleTemplate
        moduleName="Repositorio de Enlaces"
        moduleOwner="RepositorioDeEnlaces"
        fields={fields}
      />
    </div>
  );
}

export default RepositorioDeEnlaces;
