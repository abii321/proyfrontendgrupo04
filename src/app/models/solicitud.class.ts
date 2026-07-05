export class Solicitud {
  id?: number;
  usuarioId: number = 0; 
  categoriaId: number = 0;
  titulo: string = '';
  descripcion: string = '';
  archivoAdjunto: string = '';
  estado: string = 'ABIERTA';
  respuestas: any[] = [];
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  precio?: number;


}



  


   