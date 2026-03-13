import { useState, useEffect } from 'react';
import { Moon, Sun, Trophy, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import ModuleTemplate from '../../components/ModuleTemplate';
import './styles.css';

const fields = [
  { name: 'concepto', label: 'Concepto', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  { name: 'imagen', label: 'Imagen', type: 'file', accept: 'image/*', required: false },
  { name: 'enlace', label: 'Enlace', type: 'url', required: true },
];

const achievements = [
  // Por cantidad de entradas
  { id: 'primer-paso', name: '🥉 Primer paso', desc: 'Agrega tu primer enlace', category: 'cantidad', unlocked: false },
  { id: 'coleccionista', name: '📦 Coleccionista', desc: '10 enlaces guardados', category: 'cantidad', unlocked: false },
  { id: 'archivista', name: '💼 Archivista', desc: '50 enlaces guardados', category: 'cantidad', unlocked: false },
  { id: 'biblioteca', name: '🏛️ Biblioteca', desc: '100 enlaces guardados', category: 'cantidad', unlocked: false },
  { id: 'enciclopedia', name: '🌐 Enciclopedia', desc: '500 enlaces guardados', category: 'cantidad', unlocked: false },

  // Por organización
  { id: 'etiquetador', name: '🏷️ Etiquetador', desc: 'Crea tu primera categoría', category: 'organizacion', unlocked: false },
  { id: 'ordenado', name: '🗂️ Ordenado', desc: 'Tienes enlaces en 5 categorías distintas', category: 'organizacion', unlocked: false },
  { id: 'curador', name: '🎯 Curador', desc: 'Todas tus entradas tienen descripción completa', category: 'organizacion', unlocked: false },
  { id: 'limpio', name: '✂️ Limpio', desc: 'Eliminas 10 entradas duplicadas o rotas', category: 'organizacion', unlocked: false },

  // Por constancia
  { id: 'rutinario', name: '📅 Rutinario', desc: 'Agrega entradas 3 días seguidos', category: 'constancia', unlocked: false },
  { id: 'en-racha', name: '🔥 En racha', desc: '7 días seguidos activo', category: 'constancia', unlocked: false },
  { id: 'dedicado', name: '📆 Dedicado', desc: '30 días seguidos', category: 'constancia', unlocked: false },
  { id: 'obsesionado', name: '🏆 Obsesionado', desc: '100 días seguidos', category: 'constancia', unlocked: false },

  // Por exploración
  { id: 'curioso', name: '🔍 Curioso', desc: 'Usas la búsqueda por primera vez', category: 'exploracion', unlocked: false },
  { id: 'visual', name: '🖼️ Visual', desc: 'Cambias a vista moodboard/grid', category: 'exploracion', unlocked: false },
  { id: 'hacker', name: '⌨️ Hacker', desc: 'Usas un atajo de teclado', category: 'exploracion', unlocked: false },
  { id: 'nocturno', name: '🌙 Nocturno', desc: 'Activas el modo oscuro', category: 'exploracion', unlocked: false },

  // Por interacción
  { id: 'favorito', name: '❤️ Favorito', desc: 'Marcas tu primer enlace favorito', category: 'interaccion', unlocked: false },
  { id: 'fijado', name: '📌 Fijado', desc: 'Haces pin de una entrada', category: 'interaccion', unlocked: false },
  { id: 'compartido', name: '📤 Compartido', desc: 'Generas tu primer link público', category: 'interaccion', unlocked: false },
  { id: 'social', name: '👥 Social', desc: 'Invitas a un colaborador', category: 'interaccion', unlocked: false },

  // Por uso avanzado
  { id: 'automatizador', name: '🤖 Automatizador', desc: 'Usas el auto-etiquetado con IA', category: 'avanzado', unlocked: false },
  { id: 'integrador', name: '🔗 Integrador', desc: 'Conectas una integración externa', category: 'avanzado', unlocked: false },
  { id: 'previsor', name: '💾 Previsor', desc: 'Exportas tu primer backup', category: 'avanzado', unlocked: false },
  { id: 'extension', name: '🧩 Extensión', desc: 'Instalas el plugin del navegador', category: 'avanzado', unlocked: false },

  // Logros secretos
  { id: 'madrugador', name: '🌅 Madrugador', desc: 'Agregas un enlace antes de las 6am', category: 'secreto', unlocked: false },
  { id: 'trasnochador', name: '🦉 Trasnochador', desc: 'Agregas un enlace después de las 2am', category: 'secreto', unlocked: false },
  { id: 'veloz', name: '⚡ Veloz', desc: 'Creas 5 entradas en menos de 2 minutos', category: 'secreto', unlocked: false },
  { id: 'aniversario', name: '🎂 Aniversario', desc: 'Usas la app exactamente 1 año después de tu primera entrada', category: 'secreto', unlocked: false },
  { id: 'nostalgico', name: '🔄 Nostálgico', desc: 'Revisitas un enlace guardado hace más de 6 meses', category: 'secreto', unlocked: false },
  { id: 'aleatorio', name: '🎰 Aleatorio', desc: 'Abres el enlace "sorpresa" 10 veces', category: 'secreto', unlocked: false },
  { id: 'artista', name: '🌈 Artista', desc: 'Tienes entradas en 10 categorías de colores distintos', category: 'secreto', unlocked: false },
];

function RepositorioDeEnlaces() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [items, setItems] = useState([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementTab, setAchievementTab] = useState('pending'); // 'pending' or 'unlocked'
  const [userAchievements, setUserAchievements] = useState(achievements);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      calculateAchievements();
    }
  }, [items]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('student_modules')
        .select('*')
        .eq('module_owner', 'RepositorioDeEnlaces')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const calculateAchievements = () => {
    const updatedAchievements = achievements.map(achievement => {
      let unlocked = false;

      switch (achievement.id) {
        case 'primer-paso':
          unlocked = items.length > 0;
          break;
        case 'coleccionista':
          unlocked = items.length >= 10;
          break;
        case 'archivista':
          unlocked = items.length >= 50;
          break;
        case 'biblioteca':
          unlocked = items.length >= 100;
          break;
        case 'enciclopedia':
          unlocked = items.length >= 500;
          break;
        case 'curador':
          unlocked = items.every(item => item.content.descripcion && item.content.descripcion.trim() !== '');
          break;
        case 'nocturno':
          unlocked = isDarkMode; // Assuming activating dark mode unlocks it
          break;
        // Add more logic as needed
        default:
          unlocked = false;
      }

      return { ...achievement, unlocked };
    });

    setUserAchievements(updatedAchievements);
  };

  return (
    <div className={`repo-enlaces-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setShowAchievements(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg flex items-center transition-colors"
          title="Ver logros"
        >
          <Trophy className="w-5 h-5" />
        </button>
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

      {/* Modal de logros */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowAchievements(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🏆 Logros</h2>
              <button
                onClick={() => setShowAchievements(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex mb-4">
                <button
                  onClick={() => setAchievementTab('pending')}
                  className={`px-4 py-2 rounded-l-lg ${achievementTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  Por obtener ({userAchievements.filter(a => !a.unlocked).length})
                </button>
                <button
                  onClick={() => setAchievementTab('unlocked')}
                  className={`px-4 py-2 rounded-r-lg ${achievementTab === 'unlocked' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  Conseguidos ({userAchievements.filter(a => a.unlocked).length})
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {achievementTab === 'pending' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAchievements.filter(a => !a.unlocked).map(achievement => (
                    <div key={achievement.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900/60 text-gray-900 dark:text-white">
                      <div className="text-2xl mb-2">{achievement.name}</div>
                      <div className="text-sm">{achievement.desc}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAchievements.filter(a => a.unlocked).map(achievement => (
                      <div key={achievement.id} className="border border-green-300 dark:border-green-600 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                        <div className="text-2xl mb-2">{achievement.name}</div>
                      <div className="text-sm text-gray-600 dark:text-white">{achievement.desc}</div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Conseguido</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepositorioDeEnlaces;
