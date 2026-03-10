import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import ModuleTemplate from '../../components/ModuleTemplate';
import './styles.css';

const fields = [
  { name: 'concepto', label: 'Concepto', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'imagen', label: 'Imagen', type: 'file', accept: 'image/*', required: false },
  { name: 'enlace', label: 'Enlace', type: 'url', required: true },
];

function RepositorioDeEnlaces() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`repo-enlaces-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black p-2 rounded-lg transition-colors"
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      <ModuleTemplate
        moduleName="Repositorio de Enlaces"
        moduleOwner="RepositorioDeEnlaces"
        fields={fields}
      />
    </div>
  );
}

export default RepositorioDeEnlaces;
