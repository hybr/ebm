import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { FeatureFlag, FeatureFlagConfig } from '../models/feature-flag.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private readonly FEATURE_FLAGS_KEY = 'feature_flags';

  private featureFlagsSubject = new BehaviorSubject<Map<string, FeatureFlag>>(new Map());
  public featureFlags$ = this.featureFlagsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.initializeFeatureFlags();
  }

  private async initializeFeatureFlags(): Promise<void> {
    // Load cached flags first for immediate availability
    const cached = await this.storage.featureFlags.get('default');
    if (cached) {
      this.updateFlags(cached.flags);
    }

    // Then fetch fresh flags from backend
    await this.loadFeatureFlags();
  }

  async loadFeatureFlags(organizationId?: string): Promise<void> {
    const url = organizationId
      ? `${environment.apiUrl}/feature-flags?organizationId=${organizationId}`
      : `${environment.apiUrl}/feature-flags`;

    this.http.get<FeatureFlagConfig>(url).pipe(
      tap(async (config) => {
        this.updateFlags(config.flags);
        await this.storage.featureFlags.put({
          id: organizationId || 'default',
          flags: config.flags,
          lastUpdated: config.lastUpdated
        });
      }),
      catchError(async (error) => {
        console.error('Failed to load feature flags:', error);

        // Use cached data
        const cached = await this.storage.featureFlags.get(organizationId || 'default');
        if (cached) {
          this.updateFlags(cached.flags);
        }

        return of(null);
      })
    ).subscribe();
  }

  private updateFlags(flags: FeatureFlag[]): void {
    const flagMap = new Map<string, FeatureFlag>();
    flags.forEach(flag => flagMap.set(flag.key, flag));
    this.featureFlagsSubject.next(flagMap);
  }

  isFeatureEnabled(featureKey: string): boolean {
    const flag = this.featureFlagsSubject.value.get(featureKey);
    return flag?.enabled ?? false;
  }

  getFeatureFlag(featureKey: string): FeatureFlag | undefined {
    return this.featureFlagsSubject.value.get(featureKey);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.featureFlagsSubject.value.values());
  }

  getEnabledFeatures(): string[] {
    return this.getAllFlags()
      .filter(flag => flag.enabled)
      .map(flag => flag.key);
  }
}
