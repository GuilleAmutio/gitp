export interface GitProfile {
  name: string;
  email: string;
  signingKey?: string;
}

export interface GitConfig {
  profiles: {
    [key: string]: GitProfile;
  };
}

export interface AddAnswers {
  profileName: string;
  name: string;
  email: string;
  signingKey?: string;
} 