export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  organizations: UserOrganization[];
  preferences?: UserPreferences;
}

export interface UserOrganization {
  organizationId: string;
  organizationName: string;
  role: 'member' | 'admin';
  joinedAt: Date;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: boolean;
}
