import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { NavigationConfigService } from './navigation-config.service';
import { FeatureFlagService } from './feature-flag.service';
import { OrgContextService } from './org-context.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private isSyncingSubject = new BehaviorSubject<boolean>(false);
  private lastSyncSubject = new BehaviorSubject<Date | null>(null);

  public isOnline$ = this.isOnlineSubject.asObservable();
  public isSyncing$ = this.isSyncingSubject.asObservable();
  public lastSync$ = this.lastSyncSubject.asObservable();

  constructor(
    private storage: StorageService,
    private authService: AuthService,
    private navigationConfigService: NavigationConfigService,
    private featureFlagService: FeatureFlagService,
    private orgContextService: OrgContextService
  ) {
    this.initializeNetworkMonitoring();
    this.initializeAutoSync();
  }

  private initializeNetworkMonitoring(): void {
    // Listen to online/offline events
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      distinctUntilChanged()
    ).subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline);

      if (isOnline) {
        // Trigger sync when coming back online
        this.syncAll();
      }
    });
  }

  private initializeAutoSync(): void {
    // Sync when user becomes authenticated
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated && this.isOnline) {
        this.syncAll();
      }
    });

    // Periodic sync (every 5 minutes when online)
    setInterval(() => {
      if (this.isOnline && this.authService.isAuthenticated()) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  async syncAll(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncingSubject.next(true);

    try {
      await Promise.all([
        this.syncNavigationConfig(),
        this.syncFeatureFlags(),
        this.syncUserData(),
        this.syncOrganizations()
      ]);

      this.lastSyncSubject.next(new Date());
      await this.storage.cacheData('last_sync', new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncingSubject.next(false);
    }
  }

  private async syncNavigationConfig(): Promise<void> {
    const orgId = this.orgContextService.getActiveOrganization()?.id;
    await this.navigationConfigService.loadNavigationConfig(orgId);
  }

  private async syncFeatureFlags(): Promise<void> {
    const orgId = this.orgContextService.getActiveOrganization()?.id;
    await this.featureFlagService.loadFeatureFlags(orgId);
  }

  private async syncUserData(): Promise<void> {
    if (this.authService.isAuthenticated()) {
      // User data is synced via AuthService
    }
  }

  private async syncOrganizations(): Promise<void> {
    // Organizations are synced via OrgContextService
  }

  get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  get isSyncing(): boolean {
    return this.isSyncingSubject.value;
  }

  get lastSync(): Date | null {
    return this.lastSyncSubject.value;
  }
}
