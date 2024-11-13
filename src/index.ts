#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('git-profile')
  .description('CLI to manage multiple git profiles')
  .version('0.0.1');

// Example command
program
  .command('list')
  .description('List all git profiles')
  .action(() => {
    console.log(chalk.blue('Listing all profiles...'));
    // Implementation will go here
  });

program.parse();