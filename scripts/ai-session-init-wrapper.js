#!/usr/bin/env node

/**
 * AI Session Initialization Wrapper
 * Handles session startup for Claude Code and other AI tools
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Session initialization logic
function initializeSession() {
  console.log('🚀 Initializing AI session...');

  try {
    // Check if we're in the correct project directory
    const projectRoot = process.cwd();
    const packageJsonPath = path.join(projectRoot, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`📦 Project: ${packageJson.name || 'Unknown'}`);
      console.log(`📍 Location: ${projectRoot}`);
    }

    // Check git status
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const status = execSync('git status --porcelain', { encoding: 'utf8' });

      console.log(`🌿 Branch: ${branch || 'detached HEAD'}`);
      console.log(`📝 Working directory: ${status ? 'Has changes' : 'Clean'}`);
    } catch (gitError) {
      console.log('⚠️  Git status unavailable');
    }

    // Check for Nx workspace
    if (fs.existsSync(path.join(projectRoot, 'nx.json'))) {
      console.log('🔧 Nx workspace detected');

      // Check for any affected projects
      try {
        const affected = execSync('npx nx show projects --affected --base=HEAD~1', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();

        if (affected) {
          const projects = affected.split('\n').filter(Boolean);
          console.log(`⚡ Affected projects: ${projects.length > 0 ? projects.join(', ') : 'None'}`);
        }
      } catch {
        // Affected check failed, likely no commits yet
      }
    }

    // Check for running dev servers
    try {
      const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3030];
      const runningPorts = [];

      for (const port of ports) {
        try {
          execSync(`lsof -ti:${port}`, { stdio: 'ignore' });
          runningPorts.push(port);
        } catch {
          // Port not in use
        }
      }

      if (runningPorts.length > 0) {
        console.log(`🌐 Active ports: ${runningPorts.join(', ')}`);
      }
    } catch {
      // Port check failed
    }

    // Session ready
    console.log('✅ Session initialized successfully');

  } catch (error) {
    console.error('❌ Session initialization error:', error.message);
    // Don't exit with error to avoid blocking the session
  }
}

// Run initialization
initializeSession();