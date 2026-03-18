export interface LoanContent {
    articulo: string;
    persona: string;
    fecha_prestamo: string;
    fecha_devolucion: string;
    hora_limite: string;
    estado: 'Prestado' | 'Devuelto';
}

export interface LoanItem {
    id: string;
    content: LoanContent;
}

export interface LoanCounts {
    total: number;
    activos: number;
    devueltos: number;
}
