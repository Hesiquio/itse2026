import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'concepto', label: 'Concepto', type: 'text', required: true },
  { name: 'monto', label: 'Monto', type: 'number', required: true },
  { name: 'fecha', label: 'Fecha', type: 'date', required: true },
  { name: 'categoria', label: 'Categoría', type: 'select', options: ['Alimentación', 'Transporte', 'Material Escolar', 'Libros', 'Otro'], required: true },
];

function RegistroDeGastos() {
  return (
    <ModuleTemplate
      moduleName="Registro de Gastos"
      moduleOwner="RegistroDeGastos"
      fields={fields}
    />
  );
}

export default RegistroDeGastos;
