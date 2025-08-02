#!/usr/bin/env node
// Marker script to create output file for Nx tracking
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];
if (!projectName) {
  console.error('Project name required');
  process.exit(1);
}

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const markerFile = path.join(tmpDir, `typecheck-${projectName}.done`);
fs.writeFileSync(markerFile, new Date().toISOString());
