import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { NavNode } from '../models/nav-node.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigService {
  private navigationTreeSubject = new BehaviorSubject<NavNode[]>([]);
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

        // Use cached data
        const cached = await this.storage.navigationConfig.get(organizationId || 'default');
        if (cached) {
          this.navigationTreeSubject.next(cached.tree);
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

    for (const node of searchNodes) {
      if (node.route === route) return node;
      if (node.children) {
        const found = this.findNodeByRoute(route, node.children);
        if (found) return found;
      }
    }

    return null;
  }
}
