import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
    { name: 'titulo', label: 'Título del Video', type: 'text', required: true },
    { name: 'url', label: 'Link del Video', type: 'url', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
    { name: 'categoria', label: 'Categoría', type: 'text', required: false },
    { name: 'calificacion', label: 'Calificación (1-10)', type: 'number', required: false },
];

function Review() {
    return (
        <ModuleTemplate
            moduleName="Review"
            moduleOwner="Review"
            fields={fields}
        />
    );
}

export default Review;
