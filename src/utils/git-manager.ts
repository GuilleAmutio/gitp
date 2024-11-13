import { exec } from 'child_process';
import util from 'util';
import { GitProfile } from '@/types';

const execAsync = util.promisify(exec);

export class GitManager {
  private async isGitInstalled(): Promise<boolean> {
    try {
      await execAsync('git --version');
      return true;
    } catch {
      return false;
    }
  }

  private async isGitRepository(): Promise<boolean> {
    try {
      await execAsync('git rev-parse --git-dir');
      return true;
    } catch {
      return false;
    }
  }

  async setLocalConfig(profile: GitProfile): Promise<void> {
    if (!(await this.isGitInstalled())) {
      throw new Error('Git is not installed on your system');
    }

    if (!(await this.isGitRepository())) {
      throw new Error('Not a git repository. Local configuration can only be set inside a git repository');
    }

    try {
      await execAsync(`git config --local user.name "${profile.name}"`);
      await execAsync(`git config --local user.email "${profile.email}"`);
      
      if (profile.signingKey) {
        await execAsync(`git config --local user.signingkey "${profile.signingKey}"`);
        await execAsync('git config --local commit.gpgsign true');
      }
    } catch (error) {
      throw new Error('Failed to set local git configuration');
    }
  }

  async setGlobalConfig(profile: GitProfile): Promise<void> {
    if (!(await this.isGitInstalled())) {
      throw new Error('Git is not installed on your system');
    }

    try {
      await execAsync(`git config --global user.name "${profile.name}"`);
      await execAsync(`git config --global user.email "${profile.email}"`);
      
      if (profile.signingKey) {
        await execAsync(`git config --global user.signingkey "${profile.signingKey}"`);
        await execAsync('git config --global commit.gpgsign true');
      }
    } catch (error) {
      throw new Error('Failed to set global git configuration. You might need elevated permissions');
    }
  }

  async getCurrentConfig(): Promise<{ name?: string; email?: string }> {
    try {
      if (await this.isGitRepository()) {
        // Try local config first
        const { stdout: name } = await execAsync('git config --local user.name');
        const { stdout: email } = await execAsync('git config --local user.email');
        return {
          name: name.trim(),
          email: email.trim()
        };
      } else {
        // Try global config if not in a git repository
        const { stdout: name } = await execAsync('git config --global user.name');
        const { stdout: email } = await execAsync('git config --global user.email');
        return {
          name: name.trim(),
          email: email.trim()
        };
      }
    } catch {
      return {};
    }
  }
} 