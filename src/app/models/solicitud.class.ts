export class Solicitud {
  id?: number;
  id_usuario: number = 0; 
  id_categoria: number = 0;
  titulo: string = '';
  descripcion: string = '';
  archivoAdjunto: string = '';
  estado: string = 'ABIERTA';
  respuestas: any[] = [];
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  precio?: number;


}



  


   