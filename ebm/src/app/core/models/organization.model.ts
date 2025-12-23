export interface Organization {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  settings?: OrganizationSettings;
  featureFlags?: string[];
}

export interface OrganizationSettings {
  allowPublicJobs?: boolean;
  allowMarketplace?: boolean;
  customBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}
