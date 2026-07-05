export class Respuesta{

    id?:number;

    idSolicitud!:number;

    idUsuario!:number;

    respuesta!:string;

    precio!:number;

    estado!:string;

    pagada!:boolean;

    paymentId?:string;

    archivoAdjunto?:string;

}