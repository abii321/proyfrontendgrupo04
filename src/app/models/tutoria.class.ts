export class Tutoria {
    id?: number; 
    
    alumnoId: number;
    profesorId: number;
    categoriaId: number; 
    
    modalidad: 'virtual' | 'presencial';
    precioAcordado: number;
    mensaje?: string;
    fechaHora: string | Date;
    
    estado: 'pendiente' | 'aceptada' | 'rechazada' | 'finalizada' | 'completada';
    
    enlaceMeet?: string;
    googleEventId?: string;
    preferenceId?: string;
    paymentId?: string;
    pagada: boolean;

    alumno?: any;
    profesor?: any;
    categoria?: any;

    constructor(
        alumnoId: number, 
        profesorId: number, 
        categoriaId: number,
        fechaHora: string | Date, 
        precioAcordado: number,
        modalidad: 'virtual' | 'presencial' = 'virtual',
        mensaje?: string
    ) {
        this.alumnoId = alumnoId;
        this.profesorId = profesorId;
        this.categoriaId = categoriaId;
        this.fechaHora = fechaHora;
        this.precioAcordado = precioAcordado;
        this.modalidad = modalidad;
        this.mensaje = mensaje;
        
        this.estado = 'pendiente';
        this.pagada = false;
    }
}