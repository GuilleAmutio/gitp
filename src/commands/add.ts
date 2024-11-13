import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '@/utils/config-manager';
import { GitProfile, AddAnswers } from '@/types';

export function addCommand(program: Command): void {
  program
    .command('add')
    .description('Add a new git profile')
    .action(async () => {
      try {
        const configManager = new ConfigManager();
        const config = configManager.getConfig();

        // Get all profiles for duplicate checking
        const existingProfiles = Object.values(config.profiles);

        // Handle each prompt separately for better type safety
        const { profileName } = await inquirer.prompt<Pick<AddAnswers, 'profileName'>>({
          type: 'input',
          name: 'profileName',
          message: 'Enter profile name:',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Profile name is required';
            }
            if (config.profiles[input]) {
              return 'Profile name already exists';
            }
            return true;
          }
        });

        const { name } = await inquirer.prompt<Pick<AddAnswers, 'name'>>({
          type: 'input',
          name: 'name',
          message: 'Enter Git name:',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Git name is required';
            }
            return true;
          }
        });

        const { email } = await inquirer.prompt<Pick<AddAnswers, 'email'>>({
          type: 'input',
          name: 'email',
          message: 'Enter Git email:',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Git email is required';
            }

            // Check for duplicate name/email combination
            const isDuplicate = existingProfiles.some(profile => 
              profile.name === name && profile.email === input
            );

            if (isDuplicate) {
              return 'A profile with this name and email combination already exists';
            }

            return true;
          }
        });

        const { signingKey } = await inquirer.prompt<Pick<AddAnswers, 'signingKey'>>({
          type: 'input',
          name: 'signingKey',
          message: 'Enter Git signing key (optional):',
        });

        // Create the new profile
        const newProfile: GitProfile = {
          name,
          email,
          ...(signingKey ? { signingKey } : {})
        };

        // Save the new profile
        config.profiles[profileName] = newProfile;
        configManager.saveConfig(config);

        // Show the created profile details
        console.log('\nProfile created:');
        console.log(chalk.cyan('  Profile: ') + profileName);
        console.log(chalk.cyan('  Name:    ') + newProfile.name);
        console.log(chalk.cyan('  Email:   ') + newProfile.email);
        if (newProfile.signingKey) {
          console.log(chalk.cyan('  GPG Key: ') + newProfile.signingKey);
        }
        console.log();

        console.log(chalk.green('Profile created successfully! 🎉'));
        
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(chalk.red('Error creating profile:'), error.message);
        } else {
          console.error(chalk.red('An unknown error occurred'));
        }
      }
    });
} 