#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Admin Feature Factory - Orchestration Script
 * Implements the refine.dev-first workflow with SuperClaude integration
 */

import { Command } from 'commander';
import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface FeatureState {
  id: string;
  name: string;
  resource: string;
  phase: number;
  iteration: number;
  status: 'discovery' | 'scaffolded' | 'refining' | 'backend' | 'testing' | 'documenting' | 'complete';
  requirements?: {
    userStories: string[];
    rbacMatrix: Record<string, string[]>;
    schema: any;
  };
  checkpoints: {
    ui_stable: boolean;
    contracts_stable: boolean;
    mocks_complete: boolean;
    backend_ready: boolean;
  };
}

class FeatureFactory {
  private stateFile = '.claude/feature-state.json';
  private state: FeatureState | null = null;

  async loadState(): Promise<FeatureState | null> {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async saveState(state: FeatureState): Promise<void> {
    await fs.mkdir(path.dirname(this.stateFile), { recursive: true });
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }

  async startFeature(name: string): Promise<void> {
    console.log(chalk.blue('🚀 Starting Feature Factory for:'), chalk.yellow(name));
    
    // Phase 1: Discovery
    console.log(chalk.green('\n📋 Phase 1: Discovery'));
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'resource',
        message: 'Resource name (plural, kebab-case):',
        default: name.toLowerCase().replace(/\s+/g, '-'),
      },
      {
        type: 'checkbox',
        name: 'actions',
        message: 'Select CRUD actions:',
        choices: ['list', 'create', 'show', 'edit', 'delete'],
        default: ['list', 'create', 'show', 'edit'],
      },
      {
        type: 'checkbox',
        name: 'roles',
        message: 'Select roles with access:',
        choices: ['admin', 'editor', 'viewer'],
        default: ['admin', 'editor'],
      },
    ]);

    this.state = {
      id: Date.now().toString(),
      name,
      resource: answers.resource,
      phase: 1,
      iteration: 0,
      status: 'discovery',
      checkpoints: {
        ui_stable: false,
        contracts_stable: false,
        mocks_complete: false,
        backend_ready: false,
      },
    };

    await this.saveState(this.state);
    console.log(chalk.green('✓ Discovery complete'));
    
    // Auto-proceed to scaffolding
    await this.scaffold();
  }

  async scaffold(): Promise<void> {
    if (!this.state) {
      this.state = await this.loadState();
      if (!this.state) {
        console.error(chalk.red('No active feature. Run "start" first.'));
        return;
      }
    }

    console.log(chalk.green('\n🏗️  Phase 2: Scaffolding'));
    
    const command = `npm run refine create-resource ${this.state.resource} --actions list,create,show,edit --provider data-provider --ui antd`;
    
    console.log(chalk.cyan('Executing:'), command);
    
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Execute scaffolding command?',
        default: true,
      },
    ]);

    if (confirmed) {
      try {
        execSync(command, { stdio: 'inherit' });
        this.state.phase = 2;
        this.state.status = 'scaffolded';
        await this.saveState(this.state);
        console.log(chalk.green('✓ Scaffolding complete'));
        console.log(chalk.yellow(`\n👀 View your UI at: http://localhost:3007/${this.state.resource}`));
      } catch (error) {
        console.error(chalk.red('Scaffolding failed:'), error);
      }
    }
  }

  async refine(): Promise<void> {
    if (!this.state || this.state.status !== 'scaffolded' && this.state.status !== 'refining') {
      console.error(chalk.red('Must scaffold first. Run "scaffold" command.'));
      return;
    }

    console.log(chalk.green('\n🔄 Phase 3: Iterative Refinement'));
    this.state.status = 'refining';
    this.state.iteration++;
    
    console.log(chalk.cyan(`Iteration ${this.state.iteration}`));
    
    const changes = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'areas',
        message: 'What needs refinement?',
        choices: [
          'UI Components',
          'Form Validation',
          'Table Features',
          'Contracts/Schema',
          'Mock Data',
          'Error Handling',
        ],
      },
      {
        type: 'confirm',
        name: 'continue',
        message: 'Continue refining?',
        default: true,
      },
    ]);

    if (!changes.continue) {
      await this.checkpoint();
    } else {
      await this.saveState(this.state);
      console.log(chalk.yellow('💡 Make your changes, then run "refine" again or "checkpoint" to save.'));
    }
  }

  async checkpoint(): Promise<void> {
    if (!this.state) {
      console.error(chalk.red('No active feature.'));
      return;
    }

    console.log(chalk.green('\n💾 Creating Checkpoint'));
    
    const checkpoints = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ui_stable',
        message: 'Is the UI stable?',
        default: this.state.checkpoints.ui_stable,
      },
      {
        type: 'confirm',
        name: 'contracts_stable',
        message: 'Are contracts/schemas stable?',
        default: this.state.checkpoints.contracts_stable,
      },
      {
        type: 'confirm',
        name: 'mocks_complete',
        message: 'Are MSW mocks complete?',
        default: this.state.checkpoints.mocks_complete,
      },
    ]);

    this.state.checkpoints = { ...this.state.checkpoints, ...checkpoints };
    
    if (checkpoints.ui_stable && checkpoints.contracts_stable && checkpoints.mocks_complete) {
      this.state.checkpoints.backend_ready = true;
      console.log(chalk.green('✓ Ready for backend implementation!'));
    }
    
    await this.saveState(this.state);
    console.log(chalk.green('✓ Checkpoint saved'));
  }

  async backend(): Promise<void> {
    if (!this.state || !this.state.checkpoints.backend_ready) {
      console.error(chalk.red('UI and contracts must be stable first. Complete refinement phase.'));
      return;
    }

    console.log(chalk.green('\n⚙️  Phase 4: Backend Implementation'));
    this.state.phase = 4;
    this.state.status = 'backend';
    
    console.log(chalk.cyan('Backend tasks:'));
    console.log('  1. Create Supabase schema');
    console.log('  2. Implement service adapters');
    console.log('  3. Build Edge Functions');
    console.log('  4. Connect live endpoints');
    
    await this.saveState(this.state);
    console.log(chalk.yellow('💡 Implement backend components, then run "test".'));
  }

  async test(): Promise<void> {
    if (!this.state || this.state.phase < 4) {
      console.error(chalk.red('Complete backend implementation first.'));
      return;
    }

    console.log(chalk.green('\n🧪 Phase 5: Testing'));
    this.state.phase = 5;
    this.state.status = 'testing';
    
    const testCommands = [
      'pnpm test:tag --path=apps/admin --affected',
      'pnpm nx test admin',
      'pnpm playwright test apps/admin/e2e',
    ];
    
    for (const cmd of testCommands) {
      console.log(chalk.cyan(`Running: ${cmd}`));
      try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(chalk.green(`✓ ${cmd} passed`));
      } catch {
        console.log(chalk.yellow(`⚠ ${cmd} has issues`));
      }
    }
    
    await this.saveState(this.state);
    console.log(chalk.green('✓ Testing complete'));
    
    // Auto-proceed to documentation
    await this.docs();
  }

  async docs(): Promise<void> {
    if (!this.state || this.state.phase < 5) {
      console.error(chalk.red('Complete testing first.'));
      return;
    }

    console.log(chalk.green('\n📚 Phase 6: Documentation'));
    this.state.phase = 6;
    this.state.status = 'documenting';
    
    const docTasks = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'docs',
        message: 'Select documentation to generate:',
        choices: [
          'API Documentation (from Zod schemas)',
          'User Guide (with screenshots)',
          'Developer README',
          'In-app Help Tooltips',
          'Guided Tour',
        ],
        default: ['API Documentation (from Zod schemas)', 'User Guide (with screenshots)', 'Developer README'],
      },
    ]);

    // Generate documentation structure
    const docsPath = `apps/admin/docs/features/${this.state.resource}`;
    await fs.mkdir(docsPath, { recursive: true });
    await fs.mkdir(`${docsPath}/screenshots`, { recursive: true });
    
    // Copy templates
    const templates = [
      { src: 'apps/admin/docs/templates/FEATURE_README.md', dest: `${docsPath}/README.md` },
      { src: 'apps/admin/docs/templates/USER_GUIDE.md', dest: `${docsPath}/USER_GUIDE.md` },
    ];
    
    for (const template of templates) {
      try {
        const content = await fs.readFile(template.src, 'utf-8');
        const processed = content
          .replace(/\{FEATURE_NAME\}/g, this.state.name)
          .replace(/\{Feature Name\}/g, this.state.name)
          .replace(/\{feature\}/g, this.state.resource)
          .replace(/\{resources\}/g, this.state.resource)
          .replace(/\{Resources\}/g, this.state.resource.charAt(0).toUpperCase() + this.state.resource.slice(1))
          .replace(/\{Resource\}/g, this.state.resource.charAt(0).toUpperCase() + this.state.resource.slice(1).slice(0, -1));
        
        await fs.writeFile(template.dest, processed);
        console.log(chalk.green(`✓ Generated ${path.basename(template.dest)}`));
      } catch (error) {
        console.log(chalk.yellow(`⚠ Template ${template.src} not found, skipping`));
      }
    }
    
    console.log(chalk.yellow('\n💡 Documentation structure created. Next steps:'));
    console.log('  1. Capture screenshots during E2E tests');
    console.log('  2. Fill in the template placeholders');
    console.log('  3. Add in-app help components');
    console.log('  4. Generate API docs from Zod schemas');
    
    this.state.status = 'complete';
    await this.saveState(this.state);
    console.log(chalk.green('✓ Feature complete with documentation!'));
  }

  async status(): Promise<void> {
    const state = await this.loadState();
    if (!state) {
      console.log(chalk.yellow('No active feature.'));
      return;
    }

    console.log(chalk.blue('\n📊 Feature Status'));
    console.log(chalk.white('Feature:'), state.name);
    console.log(chalk.white('Resource:'), state.resource);
    console.log(chalk.white('Phase:'), `${state.phase}/5`);
    console.log(chalk.white('Status:'), state.status);
    console.log(chalk.white('Iteration:'), state.iteration);
    
    console.log(chalk.blue('\n✅ Checkpoints:'));
    Object.entries(state.checkpoints).forEach(([key, value]) => {
      const icon = value ? '✓' : '✗';
      const color = value ? chalk.green : chalk.gray;
      console.log(color(`  ${icon} ${key.replace(/_/g, ' ')}`));
    });
  }

  async resume(): Promise<void> {
    const state = await this.loadState();
    if (!state) {
      console.log(chalk.yellow('No active feature to resume.'));
      return;
    }

    this.state = state;
    console.log(chalk.blue('📂 Resuming:'), chalk.yellow(state.name));
    
    switch (state.status) {
      case 'discovery':
        await this.scaffold();
        break;
      case 'scaffolded':
      case 'refining':
        await this.refine();
        break;
      case 'backend':
        await this.backend();
        break;
      case 'testing':
        await this.test();
        break;
      case 'complete':
        console.log(chalk.green('Feature is complete!'));
        break;
    }
  }
}

// CLI Setup
const program = new Command();
const factory = new FeatureFactory();

program
  .name('admin-feature')
  .description('Admin Feature Factory - Refine.dev first workflow')
  .version('1.0.0');

program
  .command('start <name>')
  .description('Start a new feature')
  .action((name) => factory.startFeature(name));

program
  .command('scaffold')
  .description('Generate refine.dev scaffolding')
  .action(() => factory.scaffold());

program
  .command('refine')
  .description('Start refinement iteration')
  .action(() => factory.refine());

program
  .command('checkpoint')
  .description('Save stable checkpoint')
  .action(() => factory.checkpoint());

program
  .command('backend')
  .description('Implement backend')
  .action(() => factory.backend());

program
  .command('test')
  .description('Run tests')
  .action(() => factory.test());

program
  .command('docs')
  .description('Generate documentation')
  .action(() => factory.docs());

program
  .command('status')
  .description('Show current status')
  .action(() => factory.status());

program
  .command('resume')
  .description('Resume workflow')
  .action(() => factory.resume());

program.parse();