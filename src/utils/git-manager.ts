import { exec } from 'child_process';
import util from 'util';
import chalk from 'chalk';
import { GitProfile } from '@/types';

const execAsync = util.promisify(exec);

export class GitManager {
  private async configureGPG(scope: 'local' | 'global', profile: GitProfile): Promise<void> {
    if (profile.signingKey) {
      try {
        // Check if gpg is installed and accessible
        await execAsync('gpg --version');
        
        await execAsync(`git config --${scope} user.signingkey "${profile.signingKey}"`);
        await execAsync(`git config --${scope} commit.gpgsign true`);
      } catch (error) {
        // If GPG is not available, disable signing
        await execAsync(`git config --${scope} --unset user.signingkey`);
        await execAsync(`git config --${scope} commit.gpgsign false`);
        console.warn(chalk.yellow('Warning: GPG is not available. Signing has been disabled.'));
      }
    } else {
      // If no signing key is provided, ensure signing is disabled
      await execAsync(`git config --${scope} --unset user.signingkey`);
      await execAsync(`git config --${scope} commit.gpgsign false`);
    }
  }

  async setLocalConfig(profile: GitProfile): Promise<void> {
    try {
      await execAsync(`git config --local user.name "${profile.name}"`);
      await execAsync(`git config --local user.email "${profile.email}"`);
      await this.configureGPG('local', profile);
    } catch (error) {
      throw new Error('Not a git repository or git is not installed');
    }
  }

  async setGlobalConfig(profile: GitProfile): Promise<void> {
    try {
      await execAsync(`git config --global user.name "${profile.name}"`);
      await execAsync(`git config --global user.email "${profile.email}"`);
      await this.configureGPG('global', profile);
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