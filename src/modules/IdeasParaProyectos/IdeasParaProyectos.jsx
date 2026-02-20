import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'tecnologias', label: 'Tecnologías', type: 'text', required: false },
  { name: 'prioridad', label: 'Prioridad', type: 'select', options: ['Alta', 'Media', 'Baja'], required: true },
];

function IdeasParaProyectos() {
  return (
    <ModuleTemplate
      moduleName="Ideas para Proyectos"
      moduleOwner="IdeasParaProyectos"
      fields={fields}
    />
  );
}

export default IdeasParaProyectos;
