import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'autor', label: 'Autor', type: 'text', required: true },
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'ano', label: 'Año', type: 'number', required: true },
  { name: 'tipo', label: 'Tipo', type: 'select', options: ['Libro', 'Artículo', 'Sitio Web', 'Revista'], required: true },
  { name: 'url', label: 'URL', type: 'url', required: false },
];

function CitasDeReferenciasAPA() {
  return (
    <ModuleTemplate
      moduleName="Citas de Referencias APA"
      moduleOwner="CitasDeReferenciasAPA"
      fields={fields}
    />
  );
}

export default CitasDeReferenciasAPA;
