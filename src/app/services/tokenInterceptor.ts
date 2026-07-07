import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from './autenticacion.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AutenticacionService);
    const token = authService.getToken();

    if (token) {
        const tokenizeReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(tokenizeReq);
    }

    return next(req);
};