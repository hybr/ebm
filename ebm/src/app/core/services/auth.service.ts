import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, from } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { AuthToken, DecodedToken } from '../models/auth-token.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    // Check for stored token
    const token = await this.getStoredToken();
    if (token && !this.isTokenExpired(token)) {
      this.isAuthenticatedSubject.next(true);

      // Load cached user
      const cachedUser = await this.storage.getCachedData<User>(this.USER_KEY);
      if (cachedUser) {
        this.currentUserSubject.next(cachedUser);
      }

      // Fetch fresh user data if online
      this.fetchCurrentUser().subscribe();
    } else if (token) {
      // Token expired, try refresh
      this.refreshToken().subscribe();
    }
  }

  login(email: string, password: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(async (token) => {
        await this.storeToken(token);
        this.isAuthenticatedSubject.next(true);
        this.fetchCurrentUser().subscribe();
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      switchMap(() => from(this.clearAuth())),
      catchError((error) => {
        // Even if API call fails, clear local auth
        return from(this.clearAuth()).pipe(map(() => undefined));
      })
    );
  }

  private async clearAuth(): Promise<void> {
    await this.storage.cache.delete(this.TOKEN_KEY);
    await this.storage.cache.delete(this.REFRESH_TOKEN_KEY);
    await this.storage.cache.delete(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken(): Observable<AuthToken> {
    return from(this.storage.getCachedData<string>(this.REFRESH_TOKEN_KEY)).pipe(
      switchMap(refreshToken => {
        if (!refreshToken) {
          return throwError(() => new Error('No refresh token'));
        }

        return this.http.post<AuthToken>(`${environment.apiUrl}/auth/refresh`, {
          refreshToken
        }).pipe(
          switchMap(token =>
            from(this.storeToken(token)).pipe(
              tap(() => this.isAuthenticatedSubject.next(true)),
              map(() => token)
            )
          ),
          catchError((error) => {
            return from(this.clearAuth()).pipe(
              switchMap(() => throwError(() => error))
            );
          })
        );
      })
    );
  }

  private fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap(async (user) => {
        this.currentUserSubject.next(user);
        await this.storage.cacheData(this.USER_KEY, user, 60); // 60 min cache
      }),
      catchError(error => {
        console.error('Failed to fetch user:', error);
        return of(null as any);
      })
    );
  }

  async getStoredToken(): Promise<string | null> {
    return await this.storage.getCachedData<string>(this.TOKEN_KEY);
  }

  private async storeToken(token: AuthToken): Promise<void> {
    await this.storage.cacheData(this.TOKEN_KEY, token.accessToken);
    await this.storage.cacheData(this.REFRESH_TOKEN_KEY, token.refreshToken);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): DecodedToken {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
