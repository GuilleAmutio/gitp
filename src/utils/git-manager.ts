import { exec } from 'child_process';
import util from 'util';
import { GitProfile } from '@/types';

const execAsync = util.promisify(exec);

export class GitManager {
  async setLocalConfig(profile: GitProfile): Promise<void> {
    try {
      await execAsync(`git config --local user.name "${profile.name}"`);
      await execAsync(`git config --local user.email "${profile.email}"`);
      
      if (profile.signingKey) {
        await execAsync(`git config --local user.signingkey "${profile.signingKey}"`);
        await execAsync('git config --local commit.gpgsign true');
      }
    } catch (error) {
      throw new Error('Not a git repository or git is not installed');
    }
  }

  async setGlobalConfig(profile: GitProfile): Promise<void> {
    try {
      await execAsync(`git config --global user.name "${profile.name}"`);
      await execAsync(`git config --global user.email "${profile.email}"`);
      
      if (profile.signingKey) {
        await execAsync(`git config --global user.signingkey "${profile.signingKey}"`);
        await execAsync('git config --global commit.gpgsign true');
      }
    } catch (error) {
      throw new Error('Git is not installed or permission denied');
    }
  }

  async getCurrentConfig(): Promise<{ name?: string; email?: string }> {
    try {
      const { stdout: name } = await execAsync('git config --local user.name');
      const { stdout: email } = await execAsync('git config --local user.email');
      return {
        name: name.trim(),
        email: email.trim()
      };
    } catch {
      return {};
    }
  }
} 