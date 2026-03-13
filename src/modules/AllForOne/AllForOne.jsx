import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
    { name: 'producto', label: 'Producto', type: 'text', required: true },
    { name: 'tipo', label: 'Tipo de Prenda', type: 'text', required: true },
    { name: 'diseno', label: 'Diseño / Estampado', type: 'text', required: true },
    { name: 'talla', label: 'Talla', type: 'text', required: false },
    { name: 'precio', label: 'Precio ($)', type: 'number', required: false },
    { name: 'estado', label: 'Estado del Pedido', type: 'text', required: false },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
];

function AllForOne() {
    return (
        <ModuleTemplate
            moduleName="AllForOne"
            moduleOwner="AllForOne"
            fields={fields}
        />
    );
}

export default AllForOne;
