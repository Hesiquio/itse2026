/**
 * supabaseClient.js
 * -----------------
 * Configuración del cliente de Supabase para toda la aplicación.
 *
 * Credenciales tomadas del archivo .env.local en la raíz del proyecto.
 * Variables requeridas:
 *   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
 *   VITE_SUPABASE_ANON_KEY=tu-clave-anonima
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Supabase] ❌ Variables de entorno no encontradas.\n' +
        'Verifica que el archivo .env.local existe en la raíz y reinicia el servidor.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
