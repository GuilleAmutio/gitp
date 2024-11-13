import fs from 'fs';
import path from 'path';
import os from 'os';
import { GitConfig } from '@/types';

export class ConfigManager {
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.gitp');
  }

  getConfig(): GitConfig {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      return { profiles: {} };
    }
  }

  saveConfig(config: GitConfig): void {
    const configData = JSON.stringify(config, null, 2);
    const normalizedData = configData.replace(/\r?\n/g, os.EOL);
    fs.writeFileSync(this.configPath, normalizedData, 'utf8');
  }
} 