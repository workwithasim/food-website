import { ActorType, UserRole } from "@restaurant/contracts";

export interface AuthTokens {
  accessToken: string;
  expiresInSeconds: number;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  displayName: string;
  actorType: ActorType;
  tenantId?: string;
  branchIds?: string[];
  roles?: UserRole[];
  permissions?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
}
