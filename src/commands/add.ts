import { Command, Option } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from '@/utils/config-manager';
import { GitProfile } from '@/types';

export function addCommand(program: Command): void {
  program
    .command('add')
    .description('Add a new git profile')
    .argument('<profile>', 'Profile name')
    .requiredOption('-n, --name <name>', 'Git user name')
    .requiredOption('-e, --email <email>', 'Git email')
    .option('-k, --key <key>', 'GPG signing key')
    .showHelpAfterError('Use --help for usage information')
    .action(async (profile: string, options: { name: string; email: string; key?: string }) => {
      try {
        const configManager = new ConfigManager();
        const config = configManager.getConfig();

        if (config.profiles[profile]) {
          console.log(chalk.red(`Profile "${profile}" already exists`));
          return;
        }

        const newProfile: GitProfile = {
          name: options.name,
          email: options.email,
          ...(options.key && { signingKey: options.key })
        };

        config.profiles[profile] = newProfile;
        configManager.saveConfig(config);

        console.log(chalk.green(`Profile "${profile}" added successfully`));
      } catch (error) {
        console.error(chalk.red('Error adding profile:'), error);
      }
    });
} 