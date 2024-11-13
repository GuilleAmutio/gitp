import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '@/utils/config-manager';
import { GitProfile } from '@/types';
import { GitManager } from '@/utils/git-manager';

export function editCommand(program: Command): void {
  program
    .command('edit')
    .description('Edit a git profile')
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

        // First prompt: Select profile to edit
        const { profile } = await inquirer.prompt({
          type: 'list',
          name: 'profile',
          message: 'Select a profile to edit:',
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

        const currentProfile = config.profiles[profile];

        // Edit prompts
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'newProfileName',
            message: `Edit profile name (${profile}):`,
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
            message: `Edit Git signing key (${currentProfile.signingKey || 'none'}):`,
            default: '',
          }
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
        if (answers.newProfileName && answers.newProfileName !== profile) {
          delete config.profiles[profile];
          config.profiles[answers.newProfileName] = updatedProfile;
          console.log(chalk.green(`Profile name changed from "${profile}" to "${answers.newProfileName}"`));
        } else {
          config.profiles[profile] = updatedProfile;
        }

        configManager.saveConfig(config);

        // Show updated profile details
        const finalProfileName = answers.newProfileName || profile;
        console.log('\nUpdated profile details:');
        console.log(chalk.cyan('  Profile: ') + finalProfileName);
        console.log(chalk.cyan('  Name:    ') + updatedProfile.name);
        console.log(chalk.cyan('  Email:   ') + updatedProfile.email);
        if (updatedProfile.signingKey) {
          console.log(chalk.cyan('  GPG Key: ') + updatedProfile.signingKey);
        }
        console.log();

        console.log(chalk.green('Profile updated successfully! 🎉'));
        
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(chalk.red('Error editing profile:'), error.message);
        } else {
          console.error(chalk.red('An unknown error occurred'));
        }
      }
    });
} 