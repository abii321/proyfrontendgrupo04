export class Solicitud {
  id?: number;
  id_alumno: number = 1;   // hasta que tengas login
  id_categoria: number = 1;
  titulo: string = '';
  descripcion: string = '';
  precio: number = 0;
  archivoAdjunto: string = '';
  estado: string = 'ABIERTA';
  respuestas: any[] = [];
}



  


   