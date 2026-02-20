import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'prioridad', label: 'Prioridad', type: 'select', options: ['Alta', 'Media', 'Baja'], required: true },
  { name: 'fecha_limite', label: 'Fecha Límite', type: 'date', required: true },
  { name: 'estado', label: 'Estado', type: 'select', options: ['Pendiente', 'En Progreso', 'Completada'], required: true },
];

function GestorDeTareas() {
  return (
    <ModuleTemplate
      moduleName="Gestor de Tareas"
      moduleOwner="GestorDeTareas"
      fields={fields}
    />
  );
}

export default GestorDeTareas;
