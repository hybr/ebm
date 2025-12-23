export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface DecodedToken {
  userId: string;
  email: string;
  organizationId?: string;
  role?: string;
  exp: number;
  iat: number;
}
