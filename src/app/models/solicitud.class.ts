export class Solicitud {
  id?: number;
  id_usuario: number = 0; 
  id_categoria: number = 0;
  titulo: string = '';
  descripcion: string = '';
  precio: number = 0;
  archivoAdjunto: string = '';
  estado: string = 'ABIERTA';
  respuestas: any[] = [];
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;


}



  


   