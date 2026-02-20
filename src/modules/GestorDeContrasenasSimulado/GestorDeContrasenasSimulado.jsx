import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'servicio', label: 'Servicio', type: 'text', required: true },
  { name: 'usuario', label: 'Usuario', type: 'text', required: true },
  { name: 'url', label: 'URL', type: 'url', required: false },
  { name: 'notas', label: 'Notas', type: 'textarea', required: false },
];

function GestorDeContrasenasSimulado() {
  return (
    <ModuleTemplate
      moduleName="Gestor de Contraseñas Simulado"
      moduleOwner="GestorDeContrasenasSimulado"
      fields={fields}
    />
  );
}

export default GestorDeContrasenasSimulado;
