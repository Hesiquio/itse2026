import { LoanContent } from './types';

export const MODULE_OWNER = 'ControlDePrestamos';

export const INITIAL_FORM_STATE: LoanContent = {
    articulo: '',
    persona: '',
    fecha_prestamo: new Date().toISOString().split('T')[0],
    fecha_devolucion: '',
    hora_limite: '14:00',
    estado: 'Prestado',
};

export const QUICK_DATES = [
    { label: '+3 días', days: 3 },
    { label: '+1 sem', days: 7 },
    { label: '+15 días', days: 15 },
    { label: '+1 mes', days: 30 }
] as const;

export const QUICK_HOURS = ['10:00', '14:00', '16:00', '18:00'] as const;
