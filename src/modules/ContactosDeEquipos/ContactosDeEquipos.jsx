import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'equipo', label: 'Equipo', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
  { name: 'rol', label: 'Rol', type: 'text', required: false },
];

function ContactosDeEquipos() {
  return (
    <ModuleTemplate
      moduleName="Contactos de Equipos"
      moduleOwner="ContactosDeEquipos"
      fields={fields}
    />
  );
}

export default ContactosDeEquipos;
