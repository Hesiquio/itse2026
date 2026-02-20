import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'articulo', label: 'Artículo', type: 'text', required: true },
  { name: 'persona', label: 'Persona', type: 'text', required: true },
  { name: 'fecha_prestamo', label: 'Fecha de Préstamo', type: 'date', required: true },
  { name: 'fecha_devolucion', label: 'Fecha de Devolución', type: 'date', required: false },
  { name: 'estado', label: 'Estado', type: 'select', options: ['Prestado', 'Devuelto'], required: true },
];

function ControlDePrestamos() {
  return (
    <ModuleTemplate
      moduleName="Control de Préstamos"
      moduleOwner="ControlDePrestamos"
      fields={fields}
    />
  );
}

export default ControlDePrestamos;
