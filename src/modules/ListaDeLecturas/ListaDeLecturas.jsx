import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'autor', label: 'Autor', type: 'text', required: true },
  { name: 'materia', label: 'Materia', type: 'text', required: true },
  { name: 'paginas', label: 'Páginas', type: 'text', required: false },
  { name: 'estado', label: 'Estado', type: 'select', options: ['Pendiente', 'En Progreso', 'Completada'], required: true },
];

function ListaDeLecturas() {
  return (
    <ModuleTemplate
      moduleName="Lista de Lecturas"
      moduleOwner="ListaDeLecturas"
      fields={fields}
    />
  );
}

export default ListaDeLecturas;
