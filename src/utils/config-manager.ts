import fs from 'fs';
import path from 'path';
import os from 'os';
import { GitConfig } from '@/types';

export class ConfigManager {
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.gitp');
    this.ensureConfigExists();
  }

  private ensureConfigExists(): void {
    if (!fs.existsSync(this.configPath)) {
      const initialConfig: GitConfig = {
        profiles: {}
      };
      fs.writeFileSync(this.configPath, JSON.stringify(initialConfig, null, 2));
    }
  }

  public getConfig(): GitConfig {
    const configContent = fs.readFileSync(this.configPath, 'utf-8');
    return JSON.parse(configContent);
  }

  public saveConfig(config: GitConfig): void {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }
} 