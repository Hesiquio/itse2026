import MetasModuleTemplate from './MetasModuleTemplate';
import './MetasDelSemestre.css';


const fields = [
  { name: 'meta', label: 'Meta / Objetivo', type: 'text', required: true },
  { name: 'categoria', label: 'Categoría', type: 'select', options: ['Académico', 'Proyecto Grupal', 'Desarrollo Profesional', 'Personal'], required: true },
  {
    name: 'prioridad',
    label: 'Prioridad (Matriz Eisenhower)',
    type: 'select',
    options: [
      'Urgente e Importante (Hacer ahora)',
      'No Urgente pero Importante (Planificar)',
      'Urgente pero No Importante (Delegar/Minimizar)',
      'No Urgente y No Importante (Eliminar)'
    ],
    required: true
  },
  { name: 'fecha_limite', label: 'Fecha Límite', type: 'date', required: true },
  {
    name: 'estado',
    label: 'Estado de la Meta',
    type: 'select',
    options: ['Definición / Ideación', 'En Progreso', 'En Verificación', 'Completado', 'Pospuesto'],
    required: true
  },
  { name: 'progreso', label: 'Progreso (%)', type: 'select', options: ['0%', '25%', '50%', '75%', '100%'], required: true },
  { name: 'recursos', label: 'Recursos Necesarios (¿Qué necesito?)', type: 'text', required: false },
  { name: 'descripcion', label: 'Plan de Acción / Detalles', type: 'textarea', required: true },
  { name: 'lecciones', label: 'Lecciones Aprendidas (Llenar al completar)', type: 'textarea', required: false },
];

function MetasDelSemestre() {
  return (
    <MetasModuleTemplate
      moduleName="Metas del Semestre"
      moduleOwner="MetasDelSemestre"
      fields={fields}
    />
  );
}

export default MetasDelSemestre;
