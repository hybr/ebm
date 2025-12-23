export interface NavNode {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  featureKey?: string;
  requiresAuth?: boolean;
  requiresOrgAdmin?: boolean;
  visibleWhen?: 'always' | 'authenticated' | 'unauthenticated' | 'orgAdmin';
  children?: NavNode[];
  metadata?: {
    order?: number;
    badge?: string;
    customData?: any;
  };
}

export interface NavigationStack {
  currentNode: NavNode;
  parentNode?: NavNode;
  depth: number;
  breadcrumbs: NavNode[];
}
