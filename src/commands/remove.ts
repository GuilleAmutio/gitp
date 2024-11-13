import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '@/utils/config-manager';
import { GitManager } from '@/utils/git-manager';

export function removeCommand(program: Command): void {
  program
    .command('remove')
    .description('Remove a git profile')
    .action(async () => {
      try {
        const configManager = new ConfigManager();
        const config = configManager.getConfig();
        const gitManager = new GitManager();
        const currentConfig = await gitManager.getCurrentConfig();

        const profiles = Object.keys(config.profiles);
        if (profiles.length === 0) {
          console.log(chalk.yellow('No profiles found. Add one with:'));
          console.log(chalk.blue('gitp add <profile> -n <name> -e <email>'));
          return;
        }

        // Select profile to remove
        const { profile } = await inquirer.prompt({
          type: 'list',
          name: 'profile',
          message: 'Select a profile to remove:',
          choices: profiles.map(profile => {
            const isCurrent = 
              config.profiles[profile].email === currentConfig.email && 
              config.profiles[profile].name === currentConfig.name;

            if (isCurrent) {
              return new inquirer.Separator(chalk.gray(` ${profile} (current)`));
            }

            return {
              name: profile,
              value: profile,
              short: profile
            };
          }),
          pageSize: 10,
          loop: false,
          filter: (input: string) => {
            return profiles.find(p => p.toLowerCase().includes(input.toLowerCase())) || input;
          }
        });

        // Show profile details before removal
        const selectedProfile = config.profiles[profile];
        console.log('\nProfile to remove:');
        console.log(chalk.cyan('  Profile: ') + profile);
        console.log(chalk.cyan('  Name:    ') + selectedProfile.name);
        console.log(chalk.cyan('  Email:   ') + selectedProfile.email);
        if (selectedProfile.signingKey) {
          console.log(chalk.cyan('  GPG Key: ') + selectedProfile.signingKey);
        }
        console.log();

        // Confirm removal
        const { confirm } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirm',
          message: chalk.yellow('Are you sure you want to remove this profile?'),
          default: false
        });

        if (!confirm) {
          console.log(chalk.yellow('Operation cancelled'));
          return;
        }

        // Remove the profile
        delete config.profiles[profile];
        configManager.saveConfig(config);

        console.log(chalk.green(`Profile "${profile}" removed successfully! 🗑️`));
        
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(chalk.red('Error removing profile:'), error.message);
        } else {
          console.error(chalk.red('An unknown error occurred'));
        }
      }
    });
} 