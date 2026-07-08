#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectName = 'potfolio-6bw';
const buildDir = 'out';
const functionSource = path.join(__dirname, 'functions', 'api', 'contact.ts');
const functionDestination = path.join(__dirname, buildDir, 'functions', 'api', 'contact.ts');

if (fs.existsSync(functionSource)) {
  fs.mkdirSync(path.dirname(functionDestination), { recursive: true });
  fs.copyFileSync(functionSource, functionDestination);
}

// Deploy to Cloudflare Pages with project creation
const result = spawnSync('wrangler', [
  'pages',
  'deploy',
  buildDir,
  '--project-name=' + projectName,
  '--branch=master',
  '--commit-dirty=true'
], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false
});

process.exit(result.status || 0);
