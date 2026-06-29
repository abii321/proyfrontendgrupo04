export class Solicitud {

  id?: number;

  titulo: string;
  materia: string;
  descripcion: string;

  estado: string;

  fechaCreacion?: Date;
  fechaLimite?: Date;

  alumnoId: number;
  profesorId?: number;

  constructor(
    titulo: string = "",
    materia: string = "",
    descripcion: string = "",
    estado: string = "Pendiente",
    alumnoId: number = 0,
    profesorId?: number,
    fechaCreacion?: Date,
    fechaLimite?: Date,
    id?: number
  ) {
    this.id = id;
    this.titulo = titulo;
    this.materia = materia;
    this.descripcion = descripcion;
    this.estado = estado;
    this.alumnoId = alumnoId;
    this.profesorId = profesorId;
    this.fechaCreacion = fechaCreacion;
    this.fechaLimite = fechaLimite;
  }

}