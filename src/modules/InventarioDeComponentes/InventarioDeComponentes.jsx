import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'componente', label: 'Componente', type: 'text', required: true },
  { name: 'cantidad', label: 'Cantidad', type: 'number', required: true },
  { name: 'ubicacion', label: 'Ubicación', type: 'text', required: false },
  { name: 'especificaciones', label: 'Especificaciones', type: 'textarea', required: false },
];

function InventarioDeComponentes() {
  return (
    <ModuleTemplate
      moduleName="Inventario de Componentes"
      moduleOwner="InventarioDeComponentes"
      fields={fields}
    />
  );
}

export default InventarioDeComponentes;
