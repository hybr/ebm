import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { NavNode } from '../models/nav-node.model';
import { environment } from '../../../environments/environment';

const DEFAULT_NAVIGATION_TREE: NavNode[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home-outline',
    route: '/home',
    visibleWhen: 'always',
    children: [
      { id: 'home-near-me', label: 'Near Me', icon: 'location-outline', route: '/home/near-me' },
      { id: 'home-new', label: 'New', icon: 'sparkles-outline', route: '/home/new' },
      { id: 'home-top', label: 'Top', icon: 'trending-up-outline', route: '/home/top' },
      { id: 'home-all', label: 'All', icon: 'list-outline', route: '/home/all' }
    ]
  },
  {
    id: 'market',
    label: 'Market',
    icon: 'storefront-outline',
    route: '/market',
    visibleWhen: 'always',
    children: [
      { id: 'market-goods', label: 'Goods', icon: 'cube-outline', route: '/market/goods' },
      { id: 'market-services', label: 'Services', icon: 'construct-outline', route: '/market/services' },
      { id: 'market-rentals', label: 'Rentals', icon: 'key-outline', route: '/market/rentals' },
      { id: 'market-needs', label: 'Needs', icon: 'hand-left-outline', route: '/market/needs' }
    ]
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: 'calendar-outline',
    route: '/activities',
    visibleWhen: 'always',
    children: [
      {
        id: 'vacancies',
        label: 'Vacancies',
        icon: 'briefcase-outline',
        route: '/activities/vacancies',
        children: [
          { id: 'vacancies-near-me', label: 'Near Me', icon: 'location-outline', route: '/activities/vacancies/near-me' },
          { id: 'vacancies-new', label: 'New', icon: 'sparkles-outline', route: '/activities/vacancies/new' },
          { id: 'vacancies-top', label: 'Top', icon: 'trending-up-outline', route: '/activities/vacancies/top' },
          { id: 'vacancies-all', label: 'All', icon: 'list-outline', route: '/activities/vacancies/all' },
          { id: 'vacancies-applied', label: 'Applied', icon: 'checkmark-circle-outline', route: '/activities/vacancies/applied', visibleWhen: 'authenticated' },
          { id: 'vacancies-saved', label: 'Saved', icon: 'bookmark-outline', route: '/activities/vacancies/saved', visibleWhen: 'authenticated' },
          { id: 'vacancies-post', label: 'Post', icon: 'add-circle-outline', route: '/activities/vacancies/post', visibleWhen: 'orgAdmin' }
        ]
      },
      {
        id: 'appointments',
        label: 'Appointments',
        icon: 'time-outline',
        route: '/activities/appointments',
        children: [
          { id: 'appointments-person', label: 'Person', icon: 'person-outline', route: '/activities/appointments/person' },
          { id: 'appointments-organization', label: 'Organization', icon: 'business-outline', route: '/activities/appointments/organization' }
        ]
      }
    ]
  },
  {
    id: 'work',
    label: 'Work',
    icon: 'briefcase-outline',
    route: '/work',
    requiresAuth: true,
    visibleWhen: 'always',
    children: [
      { id: 'work-dashboard', label: 'Dashboard', icon: 'grid-outline', route: '/work/dashboard', featureKey: 'work_dashboard' },
      { id: 'work-processes', label: 'Processes', icon: 'git-branch-outline', route: '/work/processes' },
      { id: 'work-tasks', label: 'Tasks', icon: 'checkbox-outline', route: '/work/tasks' },
      { id: 'work-analytics', label: 'Analytics', icon: 'analytics-outline', route: '/work/analytics' }
    ]
  },
  {
    id: 'my',
    label: 'My',
    icon: 'person-outline',
    route: '/my',
    requiresAuth: true,
    visibleWhen: 'authenticated',
    children: [
      { id: 'my-profile', label: 'Profile', icon: 'person-circle-outline', route: '/my/profile' },
      { id: 'my-processes', label: 'Processes', icon: 'git-branch-outline', route: '/my/processes' },
      { id: 'my-settings', label: 'Settings', icon: 'settings-outline', route: '/my/settings' },
      { id: 'my-notifications', label: 'Notifications', icon: 'notifications-outline', route: '/my/notifications' }
    ]
  },
  {
    id: 'account',
    label: 'Account',
    icon: 'log-in-outline',
    route: '/account',
    visibleWhen: 'unauthenticated',
    children: [
      { id: 'account-login', label: 'Login', icon: 'log-in-outline', route: '/account/login' },
      { id: 'account-join', label: 'Join', icon: 'person-add-outline', route: '/account/join' },
      { id: 'account-about', label: 'About', icon: 'information-circle-outline', route: '/account/about' },
      { id: 'account-help', label: 'Help', icon: 'help-circle-outline', route: '/account/help' }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigService {
  private navigationTreeSubject = new BehaviorSubject<NavNode[]>(DEFAULT_NAVIGATION_TREE);
  public navigationTree$ = this.navigationTreeSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.initializeNavigation();
  }

  private async initializeNavigation(): Promise<void> {
    // Load cached navigation tree first for immediate display
    const cached = await this.storage.navigationConfig.get('default');
    if (cached) {
      this.navigationTreeSubject.next(cached.tree);
    }

    // Then fetch fresh data from backend
    await this.loadNavigationConfig();
  }

  async loadNavigationConfig(organizationId?: string): Promise<void> {
    const url = organizationId
      ? `${environment.apiUrl}/navigation?organizationId=${organizationId}`
      : `${environment.apiUrl}/navigation`;

    this.http.get<{ tree: NavNode[] }>(url).pipe(
      tap(async (config) => {
        this.navigationTreeSubject.next(config.tree);
        await this.storage.navigationConfig.put({
          id: organizationId || 'default',
          tree: config.tree
        });
      }),
      catchError(async (error) => {
        console.error('Failed to load navigation config:', error);

        // Use cached data or fallback to default
        const cached = await this.storage.navigationConfig.get(organizationId || 'default');
        if (cached) {
          this.navigationTreeSubject.next(cached.tree);
        } else {
          this.navigationTreeSubject.next(DEFAULT_NAVIGATION_TREE);
        }

        return of(null);
      })
    ).subscribe();
  }

  getNavigationTree(): NavNode[] {
    return this.navigationTreeSubject.value;
  }

  findNodeById(id: string, nodes?: NavNode[]): NavNode | null {
    const searchNodes = nodes || this.navigationTreeSubject.value;

    for (const node of searchNodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNodeById(id, node.children);
        if (found) return found;
      }
    }

    return null;
  }

  findNodeByRoute(route: string, nodes?: NavNode[]): NavNode | null {
    const searchNodes = nodes || this.navigationTreeSubject.value;
    // Normalize route: remove query params, fragments, and trailing slashes
    const normalizedRoute = this.normalizeRoute(route);

    for (const node of searchNodes) {
      if (node.route && this.normalizeRoute(node.route) === normalizedRoute) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeByRoute(route, node.children);
        if (found) return found;
      }
    }

    return null;
  }

  private normalizeRoute(route: string): string {
    // Remove query params and fragments
    let normalized = route.split('?')[0].split('#')[0];
    // Remove trailing slash (except for root)
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }
}
