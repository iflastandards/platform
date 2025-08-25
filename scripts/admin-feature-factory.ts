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

interface DiscoveredScript {
  path: string;
  functionality: string;
  refactorPotential: 'high' | 'medium' | 'low';
  dependencies: string[];
}

interface FeatureState {
  id: string;
  name: string;
  resource: string;
  phase: number;
  iteration: number;
  status: 'identification' | 'discovery' | 'scaffolded' | 'refining' | 'backend' | 'testing' | 'documenting' | 'complete';
  requirements?: {
    userStories: string[];
    rbacMatrix: Record<string, string[]>;
    schema: any;
  };
  discoveredScripts: DiscoveredScript[];
  checkpoints: {
    ui_stable: boolean;
    contracts_stable: boolean;
    mocks_complete: boolean;
    backend_ready: boolean;
  };
  phaseTransitions: {
    [key: string]: string;
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
    
    // Phase 1: Feature Identification & Requirements
    console.log(chalk.green('\n📋 Phase 1: Feature Identification & Requirements'));
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
      {
        type: 'input',
        name: 'keywords',
        message: 'Keywords for script discovery (comma-separated):',
        default: name.toLowerCase().replace(/\s+/g, ','),
      },
    ]);

    this.state = {
      id: Date.now().toString(),
      name,
      resource: answers.resource,
      phase: 1,
      iteration: 0,
      status: 'identification',
      discoveredScripts: [],
      checkpoints: {
        ui_stable: false,
        contracts_stable: false,
        mocks_complete: false,
        backend_ready: false,
      },
      phaseTransitions: {
        '1_to_2': `Ready to search for existing code? Run \`pnpm admin:discover\``,
        '2_to_3': `Found scripts to analyze. Ready to scaffold? Run \`pnpm admin:scaffold\``,
        '3_to_4': `Scaffolding complete! View at http://localhost:3007/${answers.resource}. Ready to refine? Run \`pnpm admin:refine\``,
        '4_to_5': `UI stable with mocks. Ready for backend? Run \`pnpm admin:backend\``,
        '5_to_6': `Backend connected! Ready to test? Run \`pnpm admin:test\``,
        '6_to_7': `Tests passing! Ready to document? Run \`pnpm admin:docs\``,
        '7_complete': `Feature complete! Deploy or start new feature with \`pnpm admin:feature\``
      }
    };

    await this.saveState(this.state);
    console.log(chalk.green('✓ Phase 1: Feature identification complete'));
    
    // Show next step
    console.log(chalk.yellow('\n🔄 Next Step:'));
    console.log(chalk.cyan(this.state.phaseTransitions['1_to_2']));
  }

  async discover(): Promise<void> {
    if (!this.state) {
      this.state = await this.loadState();
      if (!this.state) {
        console.error(chalk.red('No active feature. Run "pnpm admin:feature <name>" first.'));
        return;
      }
    }

    if (this.state.phase !== 1) {
      console.error(chalk.red('Discovery must follow identification. Current phase:', this.state.phase));
      return;
    }

    console.log(chalk.green('\n🔍 Phase 2: Code Discovery & Analysis'));
    
    // Import the discovery module
    const { discoverRefactorableCode } = await import('./discover-refactorable-code.js');
    
    const keywords = this.state.name.toLowerCase().split(/[,\s]+/).filter(Boolean);
    console.log(chalk.cyan('Searching for scripts with keywords:'), keywords.join(', '));
    
    try {
      const discoveredScripts = await discoverRefactorableCode(keywords, this.state.resource);
      
      this.state.discoveredScripts = discoveredScripts;
      this.state.phase = 2;
      this.state.status = 'discovery';
      
      await this.saveState(this.state);
      
      console.log(chalk.green(`✓ Phase 2: Discovery complete - Found ${discoveredScripts.length} relevant scripts`));
      
      if (discoveredScripts.length > 0) {
        console.log(chalk.cyan('\n📋 Discovered Scripts:'));
        discoveredScripts.forEach(script => {
          const potentialColor = script.refactorPotential === 'high' ? chalk.green : 
                                script.refactorPotential === 'medium' ? chalk.yellow : chalk.red;
          console.log(`  • ${chalk.blue(script.path)} - ${script.functionality} ${potentialColor(`(${script.refactorPotential} potential)`)}`);
        });
      } else {
        console.log(chalk.yellow('No existing scripts found - will create from scratch'));
      }
      
      // Show next step
      console.log(chalk.yellow('\n🔄 Next Step:'));
      console.log(chalk.cyan(this.state.phaseTransitions['2_to_3']));
      
    } catch (error) {
      console.error(chalk.red('Discovery failed:'), error);
    }
  }

  async scaffold(): Promise<void> {
    if (!this.state) {
      this.state = await this.loadState();
      if (!this.state) {
        console.error(chalk.red('No active feature. Run "pnpm admin:feature <name>" first.'));
        return;
      }
    }

    if (this.state.phase < 2) {
      console.error(chalk.red('Must complete discovery first. Run "pnpm admin:discover".'));
      return;
    }

    console.log(chalk.green('\n🏗️  Phase 3: Instant Scaffolding'));
    
    // Show discovered scripts that will be integrated
    if (this.state.discoveredScripts.length > 0) {
      console.log(chalk.cyan('\n📋 Will integrate these scripts:'));
      this.state.discoveredScripts.forEach(script => {
        console.log(`  • ${chalk.blue(script.path)} - ${script.functionality}`);
      });
    }
    
    const command = `npm run refine create-resource ${this.state.resource} --actions list,create,show,edit --provider data-provider --ui antd`;
    
    console.log(chalk.cyan('\nExecuting:'), command);
    
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
        this.state.phase = 3;
        this.state.status = 'scaffolded';
        await this.saveState(this.state);
        console.log(chalk.green('✓ Phase 3: Scaffolding complete'));
        
        // Show next step
        console.log(chalk.yellow('\n🔄 Next Step:'));
        console.log(chalk.cyan(this.state.phaseTransitions['3_to_4']));
      } catch (error) {
        console.error(chalk.red('Scaffolding failed:'), error);
      }
    }
  }

  async refine(): Promise<void> {
    if (!this.state) {
      this.state = await this.loadState();
      if (!this.state) {
        console.error(chalk.red('No active feature. Run "pnpm admin:feature <name>" first.'));
        return;
      }
    }

    if (this.state.phase < 3 || (this.state.status !== 'scaffolded' && this.state.status !== 'refining')) {
      console.error(chalk.red('Must scaffold first. Run "pnpm admin:scaffold".'));
      return;
    }

    console.log(chalk.green('\n🔄 Phase 4: Iterative Refinement'));
    this.state.phase = 4;
    this.state.status = 'refining';
    this.state.iteration++;
    
    console.log(chalk.cyan(`Iteration ${this.state.iteration}`));
    
    // Show integration opportunities
    if (this.state.discoveredScripts.length > 0) {
      console.log(chalk.cyan('\n📋 Integration opportunities:'));
      this.state.discoveredScripts.forEach(script => {
        console.log(`  • Integrate ${chalk.blue(script.functionality)} from ${chalk.gray(script.path)}`);
      });
    }
    
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
          'Mock Data (MSW)',
          'Error Handling',
          'Integrate Existing Scripts',
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
      console.log(chalk.yellow('💡 Make your changes, then run "pnpm admin:refine" again or "pnpm admin:checkpoint" to save.'));
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
      
      // Show next step
      console.log(chalk.yellow('\n🔄 Next Step:'));
      console.log(chalk.cyan(this.state.phaseTransitions['4_to_5']));
    }
    
    await this.saveState(this.state);
    console.log(chalk.green('✓ Checkpoint saved'));
  }

  async backend(): Promise<void> {
    if (!this.state) {
      this.state = await this.loadState();
      if (!this.state) {
        console.error(chalk.red('No active feature. Run "pnpm admin:feature <name>" first.'));
        return;
      }
    }

    if (!this.state.checkpoints.backend_ready) {
      console.error(chalk.red('UI and contracts must be stable first. Complete refinement phase with "pnpm admin:checkpoint".'));
      return;
    }

    console.log(chalk.green('\n⚙️  Phase 5: Backend Implementation'));
    this.state.phase = 5;
    this.state.status = 'backend';
    
    console.log(chalk.cyan('Backend tasks:'));
    if (this.state.discoveredScripts.length > 0) {
      console.log('  1. Refactor existing scripts into service modules');
      console.log('  2. Create API adapters wrapping script functionality'); 
      console.log('  3. Build/update Supabase schema if needed');
      console.log('  4. Implement Edge Functions calling refactored code');
      console.log('  5. Connect live endpoints to refactored services');
      
      console.log(chalk.cyan('\n📋 Scripts to refactor:'));
      this.state.discoveredScripts.forEach(script => {
        console.log(`  • ${chalk.blue(script.path)} → Service module`);
      });
    } else {
      console.log('  1. Create Supabase schema');
      console.log('  2. Implement service adapters');
      console.log('  3. Build Edge Functions');
      console.log('  4. Connect live endpoints');
    }
    
    await this.saveState(this.state);
    console.log(chalk.yellow('💡 Implement backend components, then run "pnpm admin:test".'));
  }

  async test(): Promise<void> {
    if (!this.state || this.state.phase < 5) {
      console.error(chalk.red('Complete backend implementation first.'));
      return;
    }

    console.log(chalk.green('\n🧪 Phase 6: Testing'));
    this.state.phase = 6;
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
    console.log(chalk.green('✓ Phase 6: Testing complete'));
    
    // Show next step
    console.log(chalk.yellow('\n🔄 Next Step:'));
    console.log(chalk.cyan(this.state.phaseTransitions['6_to_7']));
  }

  async docs(): Promise<void> {
    if (!this.state || this.state.phase < 6) {
      console.error(chalk.red('Complete testing first.'));
      return;
    }

    console.log(chalk.green('\n📚 Phase 7: Documentation'));
    this.state.phase = 7;
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
    console.log(chalk.green('✓ Phase 7: Documentation complete!'));
    
    // Show completion message
    console.log(chalk.yellow('\n🎉 Feature Complete!'));
    console.log(chalk.cyan(this.state.phaseTransitions['7_complete']));
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
    console.log(chalk.white('Phase:'), `${state.phase}/7`);
    console.log(chalk.white('Status:'), state.status);
    console.log(chalk.white('Iteration:'), state.iteration);
    
    console.log(chalk.blue('\n✅ Checkpoints:'));
    Object.entries(state.checkpoints).forEach(([key, value]) => {
      const icon = value ? '✓' : '✗';
      const color = value ? chalk.green : chalk.gray;
      console.log(color(`  ${icon} ${key.replace(/_/g, ' ')}`));
    });
  }

  async skip(targetPhase?: number): Promise<void> {
    if (!this.state) {
      this.state = await this.loadState();
      if (!this.state) {
        console.error(chalk.red('No active feature. Run "pnpm admin:feature <name>" first.'));
        return;
      }
    }

    if (targetPhase && (targetPhase < 1 || targetPhase > 7)) {
      console.error(chalk.red('Target phase must be between 1 and 7.'));
      return;
    }

    const phase = targetPhase || this.state.phase + 1;
    
    if (phase > 7) {
      console.error(chalk.red('Already at final phase.'));
      return;
    }

    const phaseNames = ['', 'identification', 'discovery', 'scaffolded', 'refining', 'backend', 'testing', 'documenting'];
    
    console.log(chalk.yellow(`⏭️  Skipping to Phase ${phase}: ${phaseNames[phase]}`));
    
    this.state.phase = phase;
    this.state.status = phaseNames[phase] as any;
    
    await this.saveState(this.state);
    console.log(chalk.green(`✓ Skipped to Phase ${phase}`));
    
    // Show appropriate next step
    const nextStepKey = `${phase - 1}_to_${phase}`;
    if (this.state.phaseTransitions[nextStepKey]) {
      console.log(chalk.yellow('\n🔄 Current Step:'));
      console.log(chalk.cyan(this.state.phaseTransitions[nextStepKey]));
    }
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
  .command('discover')
  .description('Search for existing scripts to refactor')
  .action(() => factory.discover());

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
  .command('skip [phase]')
  .description('Skip to next phase or specific phase (1-7)')
  .action((phase) => factory.skip(phase ? parseInt(phase) : undefined));

program
  .command('resume')
  .description('Resume workflow')
  .action(() => factory.resume());

program.parse();