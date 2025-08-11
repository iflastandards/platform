#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const envIndex = args.indexOf('--env');
const env = envIndex !== -1 ? args[envIndex + 1] : 'preview';
const validate = args.includes('--validate');

console.log(`📦 Creating unified build for ${env} environment...`);

// Configuration for different environments
const ENV_CONFIG = {
  preview: {
    baseUrl: '/platform',
    // Map source directory names to deployment paths
    sites: {
      'portal': { source: 'portal', deploy: 'portal' },
      'ISBDM': { source: 'ISBDM', deploy: 'ISBDM' }, 
      'LRM': { source: 'LRM', deploy: 'LRM' },
      'FRBR': { source: 'FRBR', deploy: 'FRBR' },
      'isbd': { source: 'isbd', deploy: 'isbd' },
      'muldicat': { source: 'muldicat', deploy: 'muldicat' }, 
      'unimarc': { source: 'unimarc', deploy: 'unimarc' }
    },
    outputDir: '_site/platform'
  },
  production: {
    baseUrl: '',
    sites: {
      'portal': { source: 'portal', deploy: 'portal' },
      'ISBDM': { source: 'ISBDM', deploy: 'ISBDM' },
      'LRM': { source: 'LRM', deploy: 'LRM' }, 
      'FRBR': { source: 'FRBR', deploy: 'FRBR' },
      'isbd': { source: 'isbd', deploy: 'isbd' },
      'muldicat': { source: 'muldicat', deploy: 'muldicat' },
      'unimarc': { source: 'unimarc', deploy: 'unimarc' }
    },
    outputDir: '_site'
  }
};

const config = ENV_CONFIG[env];
if (!config) {
  console.error(`❌ Unknown environment: ${env}`);
  process.exit(1);
}

// Create output directory
const outputDir = path.join(process.cwd(), config.outputDir);
fs.mkdirSync(outputDir, { recursive: true });

// Copy portal to root of output
const portalConfig = config.sites.portal;
const portalBuild = path.join(process.cwd(), `${portalConfig.source}/build`);
if (fs.existsSync(portalBuild)) {
  console.log('📄 Copying portal site...');
  execSync(`cp -r ${portalBuild}/* ${outputDir}/`, { stdio: 'inherit' });
} else {
  console.error('❌ Portal build not found!');
  process.exit(1);
}

// Skip admin app for now (has API routes that don't work with static export)
console.log('⏭️ Skipping admin app (focus on Docusaurus sites first)...');

// Copy each standard site
console.log('📚 Copying standard sites...');
const standardSites = Object.entries(config.sites).filter(([key, siteConfig]) => key !== 'portal');

for (const [siteKey, siteConfig] of standardSites) {
  const siteBuild = path.join(process.cwd(), `standards/${siteConfig.source}/build`);
  
  if (fs.existsSync(siteBuild)) {
    console.log(`  ✓ ${siteKey} (${siteConfig.source} -> ${siteConfig.deploy})`);
    const siteOutput = path.join(outputDir, siteConfig.deploy);
    fs.mkdirSync(siteOutput, { recursive: true });
    execSync(`cp -r ${siteBuild}/* ${siteOutput}/`, { stdio: 'inherit' });
  } else {
    console.warn(`  ⚠️  ${siteKey} build not found: standards/${siteConfig.source}/build`);
  }
}

// Create metadata file
const metadata = {
  environment: env,
  buildTime: new Date().toISOString(),
  sites: config.sites,
  baseUrl: config.baseUrl,
  gitCommit: execSync('git rev-parse HEAD').toString().trim(),
  gitBranch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
};

fs.writeFileSync(
  path.join(outputDir, 'build-metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Validation
if (validate) {
  console.log('\n🔍 Validating unified build...');
  
  let errors = 0;
  
  // Check each site has an index.html
  for (const [siteKey, siteConfig] of Object.entries(config.sites)) {
    const indexPath = siteKey === 'portal' 
      ? path.join(outputDir, 'index.html')
      : path.join(outputDir, siteConfig.deploy, 'index.html');
      
    if (!fs.existsSync(indexPath)) {
      console.error(`❌ Missing index.html for ${siteKey} (${siteConfig.deploy})`);
      errors++;
    }
  }
  
  // Check static assets
  const staticDirs = ['img', 'assets', 'css', 'js'];
  for (const dir of staticDirs) {
    const staticPath = path.join(outputDir, dir);
    if (!fs.existsSync(staticPath)) {
      console.warn(`⚠️  Missing static directory: ${dir}`);
    }
  }
  
  if (errors > 0) {
    console.error(`\n❌ Validation failed with ${errors} errors`);
    process.exit(1);
  }
  
  console.log('✅ Validation passed!');
}

// Summary
const totalSize = execSync(`du -sh ${outputDir} | cut -f1`).toString().trim();
console.log(`\n✅ Unified build created successfully!`);
console.log(`📊 Total size: ${totalSize}`);
console.log(`📁 Output: ${outputDir}`);

// Environment-specific notes
if (env === 'preview') {
  console.log(`\n📌 Preview URL: https://iflastandards.github.io/platform/`);
} else if (env === 'production') {
  console.log(`\n📌 Production URL: https://www.iflastandards.info/`);
}