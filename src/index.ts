#!/usr/bin/env node

import { Command } from 'commander';
import { addCommand } from '@/commands/add';
import { removeCommand } from '@/commands/remove';

const program = new Command();

program
  .name('gitp')
  .description('CLI to manage multiple git profiles')
  .version('0.0.1');

// Register commands
addCommand(program);
removeCommand(program);

// Show help by default if no command is provided
if (!process.argv.slice(2).length) {
  program.help();
}

program.parse();