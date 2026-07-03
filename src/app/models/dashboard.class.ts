export interface DashboardSummary {
    totalUsers: number;
    totalTutorials: number;
    totalHelpRequests: number;
    totalCategories: number;
}

export interface RoleCount {
    rol: string;
    count: string;
}

export interface StateCount {
    estado: string;
    count: string;
}

export interface MonthCount {
    month: string;
    count: string;
}

export interface TutorialUser {
    nombre: string;
    apellido: string;
    email: string;
}

export interface TutorialCategory {
    nombre: string;
}

export interface FullTutorial {
    id: number;
    estado: string;
    createdAt: string;
    alumno?: TutorialUser;
    profesor?: TutorialUser;
    categoria?: TutorialCategory;
}
