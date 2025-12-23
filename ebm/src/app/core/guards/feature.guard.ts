import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { FeatureFlagService } from '../services/feature-flag.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureGuard implements CanActivate {
  constructor(
    private featureFlagService: FeatureFlagService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const featureKey = route.data['featureKey'] as string;

    if (!featureKey) {
      // No feature key specified, allow access
      return true;
    }

    const isEnabled = this.featureFlagService.isFeatureEnabled(featureKey);

    if (!isEnabled) {
      // Feature disabled, redirect to home
      return this.router.createUrlTree(['/']);
    }

    return true;
  }
}
