export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: 'global' | 'organization' | 'user';
  metadata?: {
    module?: string;
    requiredRole?: 'member' | 'admin';
    betaFeature?: boolean;
  };
}

export interface FeatureFlagConfig {
  flags: FeatureFlag[];
  lastUpdated: Date;
}
