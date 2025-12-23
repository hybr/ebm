import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { FeatureFlagService } from './feature-flag.service';
import { NavigationConfigService } from './navigation-config.service';
import { Organization } from '../models/organization.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrgContextService {
  private readonly ACTIVE_ORG_KEY = 'active_organization';

  private activeOrganizationSubject = new BehaviorSubject<Organization | null>(null);
  private userOrganizationsSubject = new BehaviorSubject<Organization[]>([]);
  private currentRoleSubject = new BehaviorSubject<'member' | 'admin' | null>(null);

  public activeOrganization$ = this.activeOrganizationSubject.asObservable();
  public userOrganizations$ = this.userOrganizationsSubject.asObservable();
  public currentRole$ = this.currentRoleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private authService: AuthService,
    private featureFlagService: FeatureFlagService,
    private navigationConfigService: NavigationConfigService
  ) {
    this.initializeOrgContext();
  }

  private initializeOrgContext(): void {
    // Listen to auth changes
    this.authService.currentUser$.pipe(
      filter(user => user !== null)
    ).subscribe(async (user: User | null) => {
      if (user) {
        await this.loadUserOrganizations(user);

        // Try to restore last active org
        const cachedOrgId = await this.storage.getCachedData<string>(this.ACTIVE_ORG_KEY);
        if (cachedOrgId) {
          const org = this.userOrganizationsSubject.value.find(o => o.id === cachedOrgId);
          if (org) {
            await this.setActiveOrganization(org);
          }
        }
      } else {
        this.activeOrganizationSubject.next(null);
        this.userOrganizationsSubject.next([]);
        this.currentRoleSubject.next(null);
      }
    });
  }

  private async loadUserOrganizations(user: User): Promise<void> {
    try {
      // Fetch detailed org data
      const orgIds = user.organizations.map(uo => uo.organizationId);
      const organizations = await this.fetchOrganizations(orgIds).toPromise();

      if (organizations) {
        this.userOrganizationsSubject.next(organizations);
        await this.storage.cacheData('user_organizations', organizations, 30);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);

      // Fallback to cached data
      const cached = await this.storage.getCachedData<Organization[]>('user_organizations');
      if (cached) {
        this.userOrganizationsSubject.next(cached);
      }
    }
  }

  private fetchOrganizations(ids: string[]): Observable<Organization[]> {
    return this.http.post<Organization[]>(
      `${environment.apiUrl}/organizations/batch`,
      { ids }
    );
  }

  async setActiveOrganization(org: Organization): Promise<void> {
    this.activeOrganizationSubject.next(org);
    await this.storage.cacheData(this.ACTIVE_ORG_KEY, org.id);

    // Update user role for this org
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const userOrg = currentUser.organizations.find(uo => uo.organizationId === org.id);
      if (userOrg) {
        this.currentRoleSubject.next(userOrg.role);
      }
    }

    // Reload context-dependent data
    await this.reloadOrgContext();
  }

  async switchOrganization(orgId: string): Promise<boolean> {
    const org = this.userOrganizationsSubject.value.find(o => o.id === orgId);
    if (org) {
      await this.setActiveOrganization(org);
      return true;
    }
    return false;
  }

  private async reloadOrgContext(): Promise<void> {
    const org = this.activeOrganizationSubject.value;
    if (!org) return;

    // Reload feature flags for this organization
    await this.featureFlagService.loadFeatureFlags(org.id);

    // Reload navigation configuration
    await this.navigationConfigService.loadNavigationConfig(org.id);
  }

  getActiveOrganization(): Organization | null {
    return this.activeOrganizationSubject.value;
  }

  getCurrentRole(): 'member' | 'admin' | null {
    return this.currentRoleSubject.value;
  }

  isOrgAdmin(): boolean {
    return this.currentRoleSubject.value === 'admin';
  }

  hasOrganization(orgId: string): boolean {
    return this.userOrganizationsSubject.value.some(o => o.id === orgId);
  }
}
