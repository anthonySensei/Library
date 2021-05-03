import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MaterialService } from '../services/material.service';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private materialService: MaterialService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            const message = err.error.message || `Something went wrong`;
            this.materialService.openErrorSnackbar(message);
            return throwError(message);
        }));
    }
}
