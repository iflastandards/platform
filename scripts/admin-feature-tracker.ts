#!/usr/bin/env tsx

/**
 * Admin Feature Factory Tracker
 * Manages feature state, git branches, and progress tracking
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import inquirer from 'inquirer';

// Feature state schema
const PhaseStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

const PhaseSchema = z.object({
  name: z.string(),
  status: PhaseStatusSchema,
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  artifacts: z.array(z.string()).optional(),
  discoveries: z.array(z.string()).optional(),
});

const TodoSchema = z.object({
  id: z.string(),
  phase: z.number(),
  content: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  activeForm: z.string(),
});

const FeatureStateSchema = z.object({
  currentFeature: z.string(),
  branch: z.string(),
  phase: z.number(),
  status: z.enum(['in_progress', 'paused', 'completed']),
  startedAt: z.string(),
  lastCheckpoint: z.string().optional(),
  phases: z.record(z.string(), PhaseSchema),
  todos: z.array(TodoSchema),
});

type FeatureState = z.infer<typeof FeatureStateSchema>;

const STATE_FILE = '.feature-state.json';
const PHASES = [
  'Feature Identification & Requirements',
  'Code Discovery & Analysis',
  'Instant Scaffolding with Refine.dev',
  'Iterative Refinement',
  'Backend Implementation',
  'Testing',
  'Documentation',
];

class FeatureTracker {
  private state: FeatureState | null = null;

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    if (fs.existsSync(STATE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        this.state = FeatureStateSchema.parse(data);
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not load feature state'));
      }
    }
  }

  private saveState(): void {
    if (this.state) {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    }
  }

  private getCurrentBranch(): string {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  }

  private createBranch(branchName: string): void {
    const currentBranch = this.getCurrentBranch();
    if (currentBranch === 'main' || currentBranch === 'develop' || currentBranch === 'preview') {
      execSync(`git checkout -b ${branchName}`);
      console.log(chalk.green(`✅ Created and switched to branch: ${branchName}`));
    } else {
      console.log(chalk.yellow(`⚠️  Already on feature branch: ${currentBranch}`));
    }
  }

  private createCommit(message: string): void {
    try {
      execSync('git add -A');
      execSync(`git commit -m "${message}"`);
      console.log(chalk.green(`✅ Committed: ${message}`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Nothing to commit or commit failed'));
    }
  }

  async startFeature(featureName: string): Promise<void> {
    const kebabName = featureName.toLowerCase().replace(/\s+/g, '-');
    const branchName = `feature/${kebabName}`;

    // Check git status
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (gitStatus) {
      console.log(chalk.yellow('⚠️  You have uncommitted changes'));
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Create checkpoint and continue?',
          default: true,
        },
      ]);

      if (proceed) {
        this.createCommit('WIP: Checkpoint before starting new feature');
      } else {
        process.exit(1);
      }
    }

    // Create feature branch
    this.createBranch(branchName);

    // Initialize feature state
    this.state = {
      currentFeature: kebabName,
      branch: branchName,
      phase: 1,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      phases: {
        '1': {
          name: PHASES[0],
          status: 'in_progress',
          startedAt: new Date().toISOString(),
        },
      },
      todos: [
        {
          id: '1',
          phase: 1,
          content: 'Define user stories',
          status: 'pending',
          activeForm: 'Defining user stories',
        },
        {
          id: '2',
          phase: 1,
          content: 'Create RBAC matrix',
          status: 'pending',
          activeForm: 'Creating RBAC matrix',
        },
        {
          id: '3',
          phase: 1,
          content: 'Draft Zod schemas',
          status: 'pending',
          activeForm: 'Drafting Zod schemas',
        },
        {
          id: '4',
          phase: 1,
          content: 'Identify resource name',
          status: 'pending',
          activeForm: 'Identifying resource name',
        },
      ],
    };

    this.saveState();

    console.log(chalk.green(`\n🚀 Started Feature: ${featureName}`));
    console.log(chalk.blue(`🌿 Branch: ${branchName}`));
    console.log(chalk.cyan(`📍 Phase 1: ${PHASES[0]}`));
    console.log(chalk.gray('\nNext steps:'));
    this.state.todos
      .filter(t => t.phase === 1)
      .forEach(todo => {
        console.log(chalk.gray(`  - ${todo.content}`));
      });
  }

  showStatus(): void {
    if (!this.state) {
      console.log(chalk.yellow('No active feature. Use `pnpm admin:feature "name"` to start.'));
      return;
    }

    const currentPhase = this.state.phases[this.state.phase.toString()];
    const completedPhases = Object.values(this.state.phases).filter(
      p => p.status === 'completed'
    ).length;

    console.log(chalk.cyan('\n📊 Feature Status'));
    console.log(chalk.white(`Feature: ${this.state.currentFeature}`));
    console.log(chalk.white(`Branch: ${this.state.branch}`));
    console.log(chalk.white(`Phase ${this.state.phase}: ${currentPhase.name}`));
    console.log(chalk.white(`Status: ${currentPhase.status}`));

    if (currentPhase.startedAt) {
      const duration = this.getTimeDiff(currentPhase.startedAt);
      console.log(chalk.gray(`Time in phase: ${duration}`));
    }

    console.log(chalk.green(`\n✅ Completed: ${completedPhases} phases`));

    const currentTodos = this.state.todos.filter(t => t.phase === this.state!.phase);
    const completedTodos = currentTodos.filter(t => t.status === 'completed').length;
    console.log(chalk.blue(`📝 Current phase: ${completedTodos}/${currentTodos.length} tasks complete`));

    console.log(chalk.gray('\nCurrent tasks:'));
    currentTodos.forEach(todo => {
      const icon = todo.status === 'completed' ? '✅' : 
                   todo.status === 'in_progress' ? '🔄' : '⏳';
      console.log(chalk.gray(`  ${icon} ${todo.content}`));
    });
  }

  checkpoint(): void {
    if (!this.state) {
      console.log(chalk.yellow('No active feature to checkpoint'));
      return;
    }

    this.state.lastCheckpoint = new Date().toISOString();
    this.saveState();

    const message = `WIP(${this.state.currentFeature}): Phase ${this.state.phase} checkpoint`;
    this.createCommit(message);

    console.log(chalk.green(`✅ Checkpoint saved`));
    console.log(chalk.gray(`State saved to ${STATE_FILE}`));
  }

  pause(): void {
    if (!this.state) {
      console.log(chalk.yellow('No active feature to pause'));
      return;
    }

    this.checkpoint();
    this.state.status = 'paused';
    this.saveState();

    console.log(chalk.blue(`\n⏸️  Feature paused: ${this.state.currentFeature}`));
    console.log(chalk.gray(`Resume with: pnpm admin:resume`));
  }

  async resume(featureName?: string): Promise<void> {
    if (featureName) {
      // Load specific feature state
      // This would search for the feature branch and load its state
      const branchName = `feature/${featureName}`;
      try {
        execSync(`git checkout ${branchName}`);
        this.loadState();
      } catch (error) {
        console.log(chalk.red(`❌ Could not find feature branch: ${branchName}`));
        return;
      }
    } else if (this.state && this.state.status === 'paused') {
      // Resume current paused feature
      execSync(`git checkout ${this.state.branch}`);
      this.state.status = 'in_progress';
      this.saveState();
    } else {
      console.log(chalk.yellow('No paused feature to resume'));
      return;
    }

    console.log(chalk.green(`\n▶️  Resumed feature: ${this.state!.currentFeature}`));
    this.showStatus();
  }

  private getTimeDiff(startTime: string): string {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60); // minutes
    
    if (diff < 60) {
      return `${diff} minutes`;
    } else {
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      return `${hours}h ${minutes}m`;
    }
  }
}

// CLI command handling
async function main() {
  const tracker = new FeatureTracker();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'feature':
      if (args.length === 0) {
        console.log(chalk.red('Please provide a feature name'));
        process.exit(1);
      }
      await tracker.startFeature(args.join(' '));
      break;

    case 'status':
      tracker.showStatus();
      break;

    case 'checkpoint':
      tracker.checkpoint();
      break;

    case 'pause':
      tracker.pause();
      break;

    case 'resume':
      await tracker.resume(args[0]);
      break;

    default:
      console.log(chalk.yellow('Unknown command'));
      console.log('Available commands:');
      console.log('  feature <name>  - Start a new feature');
      console.log('  status         - Show current feature status');
      console.log('  checkpoint     - Save current progress');
      console.log('  pause          - Pause current feature');
      console.log('  resume [name]  - Resume a feature');
      break;
  }
}

main().catch(console.error);