import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '@/utils/config-manager';
import { GitProfile } from '@/types';

export function editCommand(program: Command): void {
  program
    .command('edit')
    .description('Edit a git profile')
    .argument('<profile>', 'Profile name')
    .showHelpAfterError('Use --help for usage information')
    .action(async (profileName: string) => {
      try {
        const configManager = new ConfigManager();
        const config = configManager.getConfig();

        if (!config.profiles[profileName]) {
          console.log(chalk.red(`Profile "${profileName}" does not exist`));
          return;
        }

        const currentProfile = config.profiles[profileName];

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'newProfileName',
            message: `Edit name of the profile (${profileName}):`,
            default: '',
          },
          {
            type: 'input',
            name: 'name',
            message: `Edit Git name (${currentProfile.name}):`,
            default: '',
          },
          {
            type: 'input',
            name: 'email',
            message: `Edit Git email (${currentProfile.email}):`,
            default: '',
          },
          {
            type: 'input',
            name: 'signingKey',
            message: `Edit Git key (${currentProfile.signingKey || 'none'}):`,
            default: '',
          },
        ]);

        // Create updated profile
        const updatedProfile: GitProfile = {
          name: answers.name || currentProfile.name,
          email: answers.email || currentProfile.email,
          ...(answers.signingKey || currentProfile.signingKey 
              ? { signingKey: answers.signingKey || currentProfile.signingKey } 
              : {})
        };

        // Handle profile name change
        if (answers.newProfileName && answers.newProfileName !== profileName) {
          delete config.profiles[profileName];
          config.profiles[answers.newProfileName] = updatedProfile;
          console.log(chalk.green(`Profile name changed from "${profileName}" to "${answers.newProfileName}"`));
        } else {
          config.profiles[profileName] = updatedProfile;
        }

        configManager.saveConfig(config);
        console.log(chalk.green('Profile updated successfully'));
      } catch (error) {
        console.error(chalk.red('Error editing profile:'), error);
      }
    });
} 