export interface GitProfile {
  name: string;
  email: string;
  signingKey?: string;
}

export interface GitConfig {
  profiles: {
    [name: string]: GitProfile;
  };
  currentGlobal?: string;
} 