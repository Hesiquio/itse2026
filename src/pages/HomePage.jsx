import { Link } from 'react-router-dom';
import { BookOpen, Calculator, Users, CreditCard, User, Link as LinkIcon, Calendar, DollarSign, CheckSquare, Lightbulb, Lock, Clock, BookMarked, AlertCircle, Target, Package, Phone, FileText } from 'lucide-react';

const modules = [
  { name: 'Gestor de Tareas', path: '/gestor-de-tareas', icon: CheckSquare, description: 'Organiza y gestiona tus tareas académicas' },
  { name: 'Calculadora de Promedios', path: '/calculadora-de-promedios', icon: Calculator, description: 'Calcula tus promedios académicos' },
  { name: 'Bitácora de Tutorías', path: '/bitacora-de-tutorias', icon: BookOpen, description: 'Registra tus sesiones de tutoría' },
  { name: 'Control de Préstamos', path: '/control-de-prestamos', icon: CreditCard, description: 'Administra préstamos de materiales' },
  { name: 'Directorio de Profesores', path: '/directorio-de-profesores', icon: User, description: 'Información de contacto de profesores' },
  { name: 'Repositorio de Enlaces', path: '/repositorio-de-enlaces', icon: LinkIcon, description: 'Guarda enlaces útiles para tus estudios' },
  { name: 'Planificador de Exámenes', path: '/planificador-de-examenes', icon: Calendar, description: 'Planifica tus fechas de examen' },
  { name: 'Registro de Gastos', path: '/registro-de-gastos', icon: DollarSign, description: 'Controla tus gastos estudiantiles' },
  { name: 'Control de Asistencias', path: '/control-de-asistencias', icon: CheckSquare, description: 'Registra tu asistencia a clases' },
  { name: 'Ideas para Proyectos', path: '/ideas-para-proyectos', icon: Lightbulb, description: 'Guarda ideas para futuros proyectos' },
  { name: 'Gestor de Contraseñas Simulado', path: '/gestor-de-contrasenas-simulado', icon: Lock, description: 'Administra tus credenciales de forma segura' },
  { name: 'Horario de Laboratorio', path: '/horario-de-laboratorio', icon: Clock, description: 'Gestiona tus horarios de laboratorio' },
  { name: 'Lista de Lecturas', path: '/lista-de-lecturas', icon: BookMarked, description: 'Organiza tus lecturas pendientes' },
  { name: 'Diario de Errores', path: '/diario-de-errores', icon: AlertCircle, description: 'Documenta errores y soluciones' },
  { name: 'Metas del Semestre', path: '/metas-del-semestre', icon: Target, description: 'Define y da seguimiento a tus metas' },
  { name: 'Inventario de Componentes', path: '/inventario-de-componentes', icon: Package, description: 'Gestiona componentes electrónicos' },
  { name: 'Contactos de Equipos', path: '/contactos-de-equipos', icon: Phone, description: 'Directorio de compañeros de equipo' },
  { name: 'Citas de Referencias APA', path: '/citas-de-referencias-apa', icon: FileText, description: 'Gestiona tus referencias bibliográficas' },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Plataforma de Gestión Estudiantil
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una colección de 18 herramientas esenciales para estudiantes.
            Gestiona tus tareas, calificaciones, horarios, gastos y mucho más en un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link
                key={index}
                to={module.path}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-200"
              >
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full p-3 mr-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {module.name}
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  {module.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Plataforma desarrollada con React, Vite, Tailwind CSS y Supabase</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
