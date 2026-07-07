export class Usuario {
    id!: number;
    rol!: string;
    nombre!: string;
    apellido!: string;
    email!: string;
    contrasenia!: string | null;
    genero!: string;
    foto!: string;
    ubicacion!: string | null;
    lat?: number | null;
    lng?: number | null;
    universidad!: string;
    carrera!: string;
    biografia?: string;
    //nivelAcademico?: string;
    //tarifaBase?: number;
    
    constructor(){
    }
}
