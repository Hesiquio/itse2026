import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
    { name: 'nombre', label: 'Nombre del Circuito', type: 'text', required: true },
    { name: 'tipo', label: 'Tipo de Luz', type: 'text', required: true },
    { name: 'voltaje', label: 'Voltaje (V)', type: 'number', required: true },
    { name: 'corriente', label: 'Corriente (A)', type: 'number', required: false },
    { name: 'ubicacion', label: 'Ubicación', type: 'text', required: false },
    { name: 'estado', label: 'Estado', type: 'text', required: false },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
];

function Luces() {
    return (
        <ModuleTemplate
            moduleName="Luces"
            moduleOwner="Luces"
            fields={fields}
        />
    );
}

export default Luces;
