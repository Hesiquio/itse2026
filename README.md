# Plataforma de Gestión Estudiantil

Una aplicación web desarrollada con React, Vite, React Router DOM, Tailwind CSS y Supabase que proporciona 18 herramientas de utilidad para estudiantes.

## Características

Esta plataforma incluye los siguientes 18 módulos:

1. **Gestor de Tareas** - Organiza y gestiona tus tareas académicas
2. **Calculadora de Promedios** - Calcula tus promedios académicos
3. **Bitácora de Tutorías** - Registra tus sesiones de tutoría
4. **Control de Préstamos** - Administra préstamos de materiales
5. **Directorio de Profesores** - Información de contacto de profesores
6. **Repositorio de Enlaces** - Guarda enlaces útiles para tus estudios
7. **Planificador de Exámenes** - Planifica tus fechas de examen
8. **Registro de Gastos** - Controla tus gastos estudiantiles
9. **Control de Asistencias** - Registra tu asistencia a clases
10. **Ideas para Proyectos** - Guarda ideas para futuros proyectos
11. **Gestor de Contraseñas Simulado** - Administra tus credenciales
12. **Horario de Laboratorio** - Gestiona tus horarios de laboratorio
13. **Lista de Lecturas** - Organiza tus lecturas pendientes
14. **Diario de Errores** - Documenta errores y soluciones
15. **Metas del Semestre** - Define y da seguimiento a tus metas
16. **Inventario de Componentes** - Gestiona componentes electrónicos
17. **Contactos de Equipos** - Directorio de compañeros de equipo
18. **Citas de Referencias APA** - Gestiona tus referencias bibliográficas

## Tecnologías Utilizadas

- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Herramienta de construcción y desarrollo rápido
- **React Router DOM** - Enrutamiento para aplicaciones React
- **Tailwind CSS** - Framework de CSS utilitario
- **Supabase** - Backend as a Service (Base de datos PostgreSQL y autenticación)
- **Lucide React** - Librería de iconos

## Estructura del Proyecto

```
src/
├── components/
│   └── ModuleTemplate.jsx    # Componente reutilizable para todos los módulos
├── modules/
│   ├── GestorDeTareas/
│   ├── CalculadoraDePromedios/
│   ├── BitacoraDeTutorias/
│   ├── ControlDePrestamos/
│   ├── DirectorioDeProfesores/
│   ├── RepositorioDeEnlaces/
│   ├── PlanificadorDeExamenes/
│   ├── RegistroDeGastos/
│   ├── ControlDeAsistencias/
│   ├── IdeasParaProyectos/
│   ├── GestorDeContrasenasSimulado/
│   ├── HorarioDeLaboratorio/
│   ├── ListaDeLecturas/
│   ├── DiarioDeErrores/
│   ├── MetasDelSemestre/
│   ├── InventarioDeComponentes/
│   ├── ContactosDeEquipos/
│   └── CitasDeReferenciasAPA/
├── pages/
│   └── HomePage.jsx           # Página principal con enlaces a todos los módulos
├── supabaseClient.js          # Configuración del cliente Supabase
├── App.tsx                    # Configuración de rutas
└── main.tsx                   # Punto de entrada de la aplicación
```

## Configuración Inicial

### 1. Instalación de Dependencias

```bash
npm install
```

### 2. Configuración de Supabase

#### A. Crear un Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que el proyecto se inicialice (puede tardar unos minutos)

#### B. Obtener las Credenciales

1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL** (URL del proyecto)
   - **anon/public key** (Clave pública/anónima)

#### C. Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Copia el contenido del archivo `.env.example`
3. Reemplaza los valores con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 3. Configurar la Base de Datos

La tabla `student_modules` ya ha sido creada mediante una migración. Esta tabla tiene la siguiente estructura:

```sql
CREATE TABLE student_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  module_owner text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb NOT NULL
);
```

**Importante:** Cada módulo filtra los datos usando el campo `module_owner`. El campo `content` almacena los datos específicos de cada módulo en formato JSON.

## Cómo Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

### Construcción para Producción

```bash
npm run build
```

### Vista Previa de la Construcción

```bash
npm run preview
```

## Despliegue en Vercel

### 1. Preparar el Repositorio

1. Inicializa un repositorio Git (si no lo has hecho):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Sube tu proyecto a GitHub, GitLab o Bitbucket

### 2. Desplegar en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Importa tu repositorio
3. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase
4. Haz clic en "Deploy"

## Guía para Estudiantes: Cómo Trabajar con tu Módulo

Cada estudiante debe trabajar con uno de los 18 módulos. A continuación, se explica cómo proceder:

### 1. Entender la Estructura del Módulo

Cada módulo sigue esta estructura básica:

```jsx
import ModuleTemplate from '../../components/ModuleTemplate';

const fields = [
  { name: 'campo1', label: 'Etiqueta 1', type: 'text', required: true },
  { name: 'campo2', label: 'Etiqueta 2', type: 'textarea', required: false },
  // ... más campos
];

function TuModulo() {
  return (
    <ModuleTemplate
      moduleName="Nombre de Tu Módulo"
      moduleOwner="TuModulo"
      fields={fields}
    />
  );
}

export default TuModulo;
```

### 2. Personalizar tu Módulo

Puedes personalizar tu módulo de las siguientes maneras:

#### A. Modificar los Campos del Formulario

Edita el array `fields` para definir qué información se captura:

```jsx
const fields = [
  {
    name: 'titulo',           // Nombre del campo en el JSON
    label: 'Título',          // Etiqueta que se muestra
    type: 'text',             // Tipo de input (text, textarea, number, date, time, email, url, select)
    required: true,           // Si el campo es obligatorio
    options: ['Op1', 'Op2']   // Solo para type: 'select'
  },
];
```

Tipos de campos disponibles:
- `text` - Campo de texto simple
- `textarea` - Campo de texto multilínea
- `number` - Campo numérico
- `date` - Selector de fecha
- `time` - Selector de hora
- `email` - Campo de email
- `url` - Campo de URL
- `select` - Menú desplegable (requiere propiedad `options`)

#### B. Crear un Componente Personalizado

Si necesitas funcionalidad más avanzada, puedes crear tu propio componente desde cero:

1. Importa el cliente de Supabase:
```jsx
import { supabase } from '../../supabaseClient';
```

2. Implementa las operaciones CRUD:

```jsx
// Obtener datos
const fetchData = async () => {
  const { data, error } = await supabase
    .from('student_modules')
    .select('*')
    .eq('module_owner', 'TuModulo')
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  return data;
};

// Agregar datos
const addData = async (content) => {
  const { data, error } = await supabase
    .from('student_modules')
    .insert([{ module_owner: 'TuModulo', content }])
    .select();

  if (error) console.error(error);
  return data;
};

// Actualizar datos
const updateData = async (id, content) => {
  const { error } = await supabase
    .from('student_modules')
    .update({ content })
    .eq('id', id);

  if (error) console.error(error);
};

// Eliminar datos
const deleteData = async (id) => {
  const { error } = await supabase
    .from('student_modules')
    .delete()
    .eq('id', id);

  if (error) console.error(error);
};
```

### 3. Buenas Prácticas

- **Siempre usa `module_owner`**: Esto asegura que los datos de tu módulo no se mezclen con otros
- **Valida los datos**: Usa el atributo `required` en los campos importantes
- **Maneja errores**: Siempre verifica si hay errores en las respuestas de Supabase
- **Usa estados de carga**: Muestra indicadores cuando los datos se están cargando
- **Confirma eliminaciones**: Pregunta al usuario antes de eliminar datos

### 4. Testing

Prueba tu módulo verificando:
- ✅ Puedes agregar nuevos elementos
- ✅ Puedes editar elementos existentes
- ✅ Puedes eliminar elementos
- ✅ Los datos persisten después de recargar la página
- ✅ Los datos de tu módulo no afectan otros módulos

## Solución de Problemas

### Error: "Missing Supabase environment variables"

**Causa:** No se configuraron las variables de entorno.

**Solución:** Asegúrate de crear el archivo `.env.local` con las credenciales correctas de Supabase.

### Error al conectar con Supabase

**Causa:** Credenciales incorrectas o proyecto de Supabase no inicializado.

**Solución:**
1. Verifica que tu proyecto de Supabase esté activo
2. Confirma que las credenciales en `.env.local` sean correctas
3. Asegúrate de que la tabla `student_modules` exista en tu base de datos

### Los datos no se muestran

**Causa:** El campo `module_owner` no coincide.

**Solución:** Verifica que el valor de `moduleOwner` en tu componente coincida exactamente con el valor usado en las consultas.

## Recursos Adicionales

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de React Router](https://reactrouter.com)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

## Licencia

Este proyecto es de código abierto y está disponible para uso educativo.
