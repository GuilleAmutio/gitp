#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { addCommand } from '@/commands/add';
import { removeCommand } from '@/commands/remove';
import { editCommand } from '@/commands/edit';
import { ConfigManager } from '@/utils/config-manager';
import { GitManager } from '@/utils/git-manager';

const program = new Command();

program
  .name('gitp')
  .description('CLI to manage multiple git profiles')
  .version('0.0.1');

// Register commands
addCommand(program);
removeCommand(program);
editCommand(program);

// Main command handler
async function handleMainCommand() {
  try {
    const configManager = new ConfigManager();
    const gitManager = new GitManager();
    const config = configManager.getConfig();
    const currentConfig = await gitManager.getCurrentConfig();

    const profiles = Object.keys(config.profiles);
    if (profiles.length === 0) {
      console.log(chalk.yellow('No profiles found. Add one with:'));
      console.log(chalk.blue('gitp add'));
      return;
    }

    // First prompt: Select profile
    const choices = profiles.map(profile => {
      const isCurrent = 
        config.profiles[profile].email === currentConfig.email && 
        config.profiles[profile].name === currentConfig.name;

      return {
        name: isCurrent ? chalk.yellow(`${profile} (current)`) : profile,
        value: profile,
        short: profile
      };
    });

    const { profile } = await inquirer.prompt({
      type: 'list',
      name: 'profile',
      message: 'Select a profile:',
      choices,
      pageSize: 10,
      loop: false,
      filter: (input: string) => {
        return profiles.find(p => p.toLowerCase().includes(input.toLowerCase())) || input;
      }
    });

    // Second prompt: Select scope
    const { scope } = await inquirer.prompt({
      type: 'list',
      name: 'scope',
      message: 'Select configuration scope:',
      choices: [
        { 
          name: chalk.blue('Local') + ' - Only for this repository',
          value: 'local'
        },
        { 
          name: chalk.yellow('Global') + ' - For all repositories',
          value: 'global'
        }
      ],
      pageSize: 2,
      loop: false
    });

    // Show profile details
    const selectedProfile = config.profiles[profile];
    console.log('\nProfile details:');
    console.log(chalk.cyan('  Profile: ') + profile);
    console.log(chalk.cyan('  Name:    ') + selectedProfile.name);
    console.log(chalk.cyan('  Email:   ') + selectedProfile.email);
    if (selectedProfile.signingKey) {
      console.log(chalk.cyan('  GPG Key: ') + selectedProfile.signingKey);
    }
    console.log(chalk.cyan('  Scope:   ') + (scope === 'local' ? 'Local (this repository)' : 'Global (all repositories)'));
    console.log(); // Empty line for better readability

    // Apply the selected profile with the chosen scope
    if (scope === 'global') {
      await gitManager.setGlobalConfig(selectedProfile);
      console.log(chalk.green(`Successfully set global git config to profile: ${profile}`));
    } else {
      try {
        await gitManager.setLocalConfig(selectedProfile);
        console.log(chalk.green(`Successfully set local git config to profile: ${profile}`));
      } catch (error) {
        if (error instanceof Error && error.message.includes('Not a git repository')) {
          console.error(chalk.red('\nError: Cannot set local configuration outside of a git repository.'));
          console.log(chalk.yellow('Tip: Either:'));
          console.log(chalk.yellow('1. Navigate to a git repository'));
          console.log(chalk.yellow('2. Initialize a new git repository with `git init`'));
          console.log(chalk.yellow('3. Or choose global scope instead'));
          return;
        }
        throw error;
      }
    }

    console.log(chalk.yellow('Happy coding! 🚀'));
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('Not a git repository')) {
        console.error(chalk.red('Error: Not in a git repository'));
      } else {
        console.error(chalk.red('Error:'), error.message);
      }
    } else {
      console.error(chalk.red('An unknown error occurred'));
    }
  }
}

// If no arguments provided, run the interactive profile selector
if (process.argv.length === 2) {
  handleMainCommand();
} else {
  program.parse();
}