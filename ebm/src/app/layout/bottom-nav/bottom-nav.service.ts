import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavNode, NavigationStack } from '../../core/models/nav-node.model';
import { NavigationConfigService } from '../../core/services/navigation-config.service';
import { FeatureFlagService } from '../../core/services/feature-flag.service';
import { AuthService } from '../../core/services/auth.service';
import { OrgContextService } from '../../core/services/org-context.service';

@Injectable({
  providedIn: 'root'
})
export class BottomNavService {
  private navigationStackSubject = new BehaviorSubject<NavigationStack | null>(null);
  private visibleNavItemsSubject = new BehaviorSubject<NavNode[]>([]);

  public navigationStack$ = this.navigationStackSubject.asObservable();
  public visibleNavItems$ = this.visibleNavItemsSubject.asObservable();

  constructor(
    private router: Router,
    private location: Location,
    private navigationConfigService: NavigationConfigService,
    private featureFlagService: FeatureFlagService,
    private authService: AuthService,
    private orgContextService: OrgContextService
  ) {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateNavigationStack(event.urlAfterRedirects);
    });

    // Rebuild nav when navigation tree changes
    this.navigationConfigService.navigationTree$.subscribe(() => {
      this.updateVisibleNavItems();
      if (this.router.url) {
        this.updateNavigationStack(this.router.url);
      }
    });

    // Rebuild nav when auth state changes
    this.authService.isAuthenticated$.subscribe(() => {
      this.updateVisibleNavItems();
    });

    // Rebuild nav when org context changes
    this.orgContextService.activeOrganization$.subscribe(() => {
      this.updateVisibleNavItems();
    });
  }

  private updateNavigationStack(url: string): void {
    const currentNode = this.navigationConfigService.findNodeByRoute(url);

    if (currentNode) {
      const breadcrumbs = this.buildBreadcrumbs(currentNode);
      const parentNode = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : undefined;

      const stack: NavigationStack = {
        currentNode,
        parentNode,
        depth: breadcrumbs.length,
        breadcrumbs
      };

      this.navigationStackSubject.next(stack);

      // Update visible nav items based on current depth
      // At root level (depth 1), always show the primary navigation tabs
      if (breadcrumbs.length === 1) {
        // Show root level (5 primary tabs: Home, Market, Activities, Work, My/Account)
        this.updateVisibleNavItems();
      } else if (currentNode.children && currentNode.children.length > 0) {
        // Show children of current node
        this.updateVisibleNavItems(currentNode.children);
      } else if (parentNode && parentNode.children) {
        // Show siblings (children of parent)
        this.updateVisibleNavItems(parentNode.children);
      } else {
        // Show root level
        this.updateVisibleNavItems();
      }
    } else {
      // Reset to root
      this.navigationStackSubject.next(null);
      this.updateVisibleNavItems();
    }
  }

  private buildBreadcrumbs(node: NavNode): NavNode[] {
    const breadcrumbs: NavNode[] = [];
    const tree = this.navigationConfigService.getNavigationTree();

    const findPath = (current: NavNode, nodes: NavNode[], path: NavNode[]): boolean => {
      for (const n of nodes) {
        const newPath = [...path, n];

        if (n.id === current.id) {
          breadcrumbs.push(...newPath);
          return true;
        }

        if (n.children && findPath(current, n.children, newPath)) {
          return true;
        }
      }

      return false;
    };

    findPath(node, tree, []);
    return breadcrumbs;
  }

  private updateVisibleNavItems(nodes?: NavNode[]): void {
    const sourceNodes = nodes || this.navigationConfigService.getNavigationTree();
    const visibleNodes = this.filterVisibleNodes(sourceNodes);
    this.visibleNavItemsSubject.next(visibleNodes);
  }

  private filterVisibleNodes(nodes: NavNode[]): NavNode[] {
    const isAuthenticated = this.authService.isAuthenticated();
    const isOrgAdmin = this.orgContextService.isOrgAdmin();

    return nodes.filter(node => {
      // Check feature flag
      if (node.featureKey && !this.featureFlagService.isFeatureEnabled(node.featureKey)) {
        return false;
      }

      // Note: requiresAuth only controls route access (via AuthGuard), not nav visibility
      // Note: requiresOrgAdmin only controls route access (via OrgAdminGuard), not nav visibility

      // Check visibility rules
      switch (node.visibleWhen) {
        case 'authenticated':
          return isAuthenticated;
        case 'unauthenticated':
          return !isAuthenticated;
        case 'orgAdmin':
          return isOrgAdmin;
        case 'always':
        default:
          return true;
      }
    }).sort((a, b) => {
      // Sort by order metadata
      const orderA = a.metadata?.order ?? 999;
      const orderB = b.metadata?.order ?? 999;
      return orderA - orderB;
    });
  }

  push(node: NavNode): void {
    if (node.route) {
      this.router.navigate([node.route]);
    }
  }

  pop(): void {
    const stack = this.navigationStackSubject.value;
    if (stack && stack.parentNode?.route) {
      this.router.navigate([stack.parentNode.route]);
    } else if (stack && stack.breadcrumbs && stack.breadcrumbs.length > 1) {
      // Navigate to the parent in breadcrumbs
      const parent = stack.breadcrumbs[stack.breadcrumbs.length - 2];
      if (parent?.route) {
        this.router.navigate([parent.route]);
      } else {
        this.location.back();
      }
    } else {
      // Use browser history as fallback
      this.location.back();
    }
  }

  navigateToRoot(): void {
    this.router.navigate(['/']);
  }

  getCurrentStack(): NavigationStack | null {
    return this.navigationStackSubject.value;
  }

  getVisibleItems(): NavNode[] {
    return this.visibleNavItemsSubject.value;
  }
}
