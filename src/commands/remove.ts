import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from '@/utils/config-manager';

export function removeCommand(program: Command): void {
  program
    .command('remove')
    .description('Remove a git profile')
    .argument('<profile>', 'Profile name')
    .showHelpAfterError('Use --help for usage information')
    .action(async (profile: string) => {
      try {
        const configManager = new ConfigManager();
        const config = configManager.getConfig();

        if (!config.profiles[profile]) {
          console.log(chalk.red(`Profile "${profile}" does not exist`));
          return;
        }

        delete config.profiles[profile];
        configManager.saveConfig(config);

        console.log(chalk.green(`Profile "${profile}" removed successfully`));
      } catch (error) {
        console.error(chalk.red('Error removing profile:'), error);
      }
    });
} 