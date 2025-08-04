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
    sites: ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc'],
    outputDir: '_site/platform'
  },
  production: {
    baseUrl: '',
    sites: ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc'],
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
const portalBuild = path.join(process.cwd(), 'portal/build');
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
const standardSites = config.sites.filter(site => site !== 'portal');

for (const site of standardSites) {
  const siteBuild = path.join(process.cwd(), `standards/${site}/build`);
  
  if (fs.existsSync(siteBuild)) {
    console.log(`  ✓ ${site}`);
    const siteOutput = path.join(outputDir, site);
    fs.mkdirSync(siteOutput, { recursive: true });
    execSync(`cp -r ${siteBuild}/* ${siteOutput}/`, { stdio: 'inherit' });
  } else {
    console.warn(`  ⚠️  ${site} build not found, skipping...`);
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
  for (const site of config.sites) {
    const indexPath = site === 'portal' 
      ? path.join(outputDir, 'index.html')
      : path.join(outputDir, site, 'index.html');
      
    if (!fs.existsSync(indexPath)) {
      console.error(`❌ Missing index.html for ${site}`);
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