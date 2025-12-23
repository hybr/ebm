import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Convert async operation to Observable
    return from(this.authService.getStoredToken()).pipe(
      switchMap(token => {
        // Clone request and add token if available
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // Token expired, try to refresh
              return this.authService.refreshToken().pipe(
                switchMap(() => {
                  // Retry original request with new token
                  return from(this.authService.getStoredToken()).pipe(
                    switchMap(newToken => {
                      const retryRequest = request.clone({
                        setHeaders: {
                          Authorization: `Bearer ${newToken}`
                        }
                      });
                      return next.handle(retryRequest);
                    })
                  );
                }),
                catchError(refreshError => {
                  // Refresh failed, user needs to login again
                  return throwError(() => refreshError);
                })
              );
            }

            return throwError(() => error);
          })
        );
      })
    );
  }
}
