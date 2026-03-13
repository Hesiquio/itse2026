import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
    { name: 'titulo', label: 'Título del evento', type: 'text', required: true },
    { name: 'tipo', label: 'Tipo', type: 'select', options: ['Examen', 'Tarea / Entrega', 'Festivo', 'Fecha Inhábil', 'Reunión', 'Otro'], required: true },
    { name: 'fecha', label: 'Fecha', type: 'date', required: true },
    { name: 'hora', label: 'Hora', type: 'time', required: false },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
];

function Calendario() {
    return (
        <ModuleTemplate
            moduleName="Calendario"
            moduleOwner="Calendario"
            fields={fields}
        />
    );
}

export default Calendario;
