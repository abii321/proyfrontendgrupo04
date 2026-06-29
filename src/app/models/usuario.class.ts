export class Usuario {
    idUsuario!: number;
    nombre!: string;
    apellido!: string;
    email!: string;
    password!: string | null;
    rol!: string;
    foto!: string;
    ubicacion!: string | null;
    universidad!: string;
    carrera!: string;
    
    constructor(){
    }
}
