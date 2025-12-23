import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { OrgContextService } from '../services/org-context.service';

@Injectable({
  providedIn: 'root'
})
export class OrgAdminGuard implements CanActivate {
  constructor(
    private orgContextService: OrgContextService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.orgContextService.currentRole$.pipe(
      take(1),
      map(role => {
        if (role === 'admin') {
          return true;
        } else {
          // Redirect to unauthorized page
          return this.router.createUrlTree(['/unauthorized']);
        }
      })
    );
  }
}
