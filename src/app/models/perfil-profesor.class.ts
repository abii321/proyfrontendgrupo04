export class PerfilProfesor {
    idPerfilProfesor!: number;
    primario!: boolean;
    secundario!: boolean;
    terciario!: boolean;
    universitario!: boolean;
    doctorado!: boolean;
    
    constructor(){
        this.primario=false;
        this.secundario=false;
        this.universitario=false;
        this.doctorado=false;
    }
}
