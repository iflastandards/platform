#!/usr/bin/env node

/**
 * Interactive Admin Role Testing Tool
 * Allows developers to test different role combinations for the admin portal
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const readline = require('readline');
const execAsync = promisify(exec);

// Import site configuration to get dynamic site list
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}[ROLE-TEST]${colors.reset} ${message}`);
}

function success(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function error(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function warning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function highlight(message) {
  console.log(`${colors.cyan}${colors.bold}${message}${colors.reset}`);
}

// IFLA Namespaces and their review groups
const NAMESPACES = {
  LRM: {
    name: 'Library Reference Model',
    sites: ['lrm'],
    reviewGroup: 'LRM Review Group',
  },
  ISBD: {
    name: 'International Standard Bibliographic Description',
    sites: ['isbd', 'isbdm'],
    reviewGroup: 'ISBD Review Group',
    plannedSites: 7,
  },
  MulDiCat: {
    name: 'Multilingual Dictionary of Cataloguing Terms',
    sites: ['muldicat'],
    reviewGroup: 'MulDiCat Review Group',
  },
  FR: {
    name: 'Functional Requirements',
    sites: ['frbr'],
    reviewGroup: 'FR Review Group',
    note: 'Currently named FRBR, will be renamed to FR',
  },
  UNIMARC: {
    name: 'Universal MARC Format',
    sites: ['unimarc'],
    reviewGroup: 'UNIMARC Review Group',
  },
};

// Role definitions
const ROLES = {
  // Global roles
  'system-admin': {
    level: 'system',
    description: 'Full system administration',
    scope: 'all namespaces and sites',
  },
  'ifla-admin': {
    level: 'system',
    description: 'IFLA organization admin',
    scope: 'all namespaces and sites',
  },

  // Namespace roles
  'namespace-admin': {
    level: 'namespace',
    description: 'Full control of namespace',
    scope: 'specific namespace',
  },
  'namespace-editor': {
    level: 'namespace',
    description: 'Edit content across namespace',
    scope: 'specific namespace',
  },
  'namespace-reviewer': {
    level: 'namespace',
    description: 'Review/approve changes',
    scope: 'specific namespace',
  },
  'namespace-translator': {
    level: 'namespace',
    description: 'Translate content',
    scope: 'specific namespace',
  },
  'namespace-contributor': {
    level: 'namespace',
    description: 'Propose changes',
    scope: 'specific namespace',
  },

  // Site roles
  'site-admin': {
    level: 'site',
    description: 'Site administration',
    scope: 'specific site',
  },
  'site-editor': {
    level: 'site',
    description: 'Edit site content',
    scope: 'specific site',
  },
  'site-translator': {
    level: 'site',
    description: 'Translate site content',
    scope: 'specific site',
  },
  'site-contributor': {
    level: 'site',
    description: 'Contribute to site',
    scope: 'specific site',
  },
};

// Get all sites from configuration
function getAllSites() {
  try {
    // Try to read from siteConfig.ts
    const configPath = path.join(
      __dirname,
      '../packages/theme/src/config/siteConfig.ts',
    );
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');

      // Extract site keys from SITE_CONFIG
      const siteKeyMatch = configContent.match(
        /export type SiteKey = ([^;]+);/,
      );
      if (siteKeyMatch) {
        const siteKeysStr = siteKeyMatch[1];
        const siteKeys =
          siteKeysStr
            .replace(/'/g, '"')
            .match(/"([^"]+)"/g)
            ?.map((s) => s.replace(/"/g, '')) || [];

        return siteKeys;
      }
    }
  } catch (e) {
    warning('Could not read site configuration, using default sites');
  }

  // Fallback to default sites
  return [
    'portal',
    'isbdm',
    'lrm',
    'frbr',
    'isbd',
    'muldicat',
    'unimarc',
    'newtest',
  ];
}

// Command line argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    role: null,
    namespace: null,
    namespaces: [],
    site: null,
    sites: [],
    interactive: true,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--role':
        options.role = args[++i];
        options.interactive = false;
        break;
      case '--namespace':
        options.namespace = args[++i];
        options.interactive = false;
        break;
      case '--namespaces':
        options.namespaces = args[++i]?.split(',') || [];
        options.interactive = false;
        break;
      case '--site':
        options.site = args[++i];
        options.interactive = false;
        break;
      case '--sites':
        options.sites = args[++i]?.split(',') || [];
        options.interactive = false;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

// Display help information
function showHelp() {
  console.log(`
${colors.bold}IFLA Standards Role Testing Tool${colors.reset}

${colors.green}USAGE:${colors.reset}
  ${colors.cyan}pnpm test:admin:roles${colors.reset}                                    # Interactive mode
  ${colors.cyan}pnpm test:admin:roles --role <role> --namespace <namespace>${colors.reset}  # Command-line mode
  ${colors.cyan}pnpm test:admin:roles --role <role> --site <site>${colors.reset}             # Site-specific role

${colors.green}OPTIONS:${colors.reset}
  ${colors.yellow}--role <role>${colors.reset}              Role to test (see available roles below)
  ${colors.yellow}--namespace <namespace>${colors.reset}    Namespace for role (LRM, ISBD, MulDiCat, FR, UNIMARC)
  ${colors.yellow}--namespaces <ns1,ns2>${colors.reset}     Multiple namespaces (comma-separated)
  ${colors.yellow}--site <site>${colors.reset}              Site for role (portal, isbdm, lrm, etc.)
  ${colors.yellow}--sites <s1,s2>${colors.reset}            Multiple sites (comma-separated)
  ${colors.yellow}--help, -h${colors.reset}                 Show this help

${colors.green}AVAILABLE ROLES:${colors.reset}
${colors.magenta}System Level:${colors.reset}
  system-admin         Full system administration
  ifla-admin          IFLA organization admin

${colors.magenta}Namespace Level:${colors.reset}
  namespace-admin     Full control of namespace
  namespace-editor    Edit content across namespace
  namespace-reviewer  Review/approve changes
  namespace-translator Translate content  
  namespace-contributor Propose changes

${colors.magenta}Site Level:${colors.reset}
  site-admin          Site administration
  site-editor         Edit site content
  site-translator     Translate site content
  site-contributor    Contribute to site

${colors.green}AVAILABLE NAMESPACES:${colors.reset}
  LRM        Library Reference Model
  ISBD       International Standard Bibliographic Description (isbd, isbdm + 7 planned)
  MulDiCat   Multilingual Dictionary of Cataloguing Terms
  FR         Functional Requirements (currently FRBR)
  UNIMARC    Universal MARC Format

${colors.green}EXAMPLES:${colors.reset}
  ${colors.cyan}pnpm test:admin:roles --role namespace-admin --namespace ISBD${colors.reset}
  ${colors.cyan}pnpm test:admin:roles --role site-admin --site isbdm${colors.reset}
  ${colors.cyan}pnpm test:admin:roles --role translator --namespaces ISBD,FR${colors.reset}
  ${colors.cyan}pnpm test:admin:roles --role system-admin${colors.reset}
`);
}

// Create readline interface for interactive input
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Interactive role selection
async function selectRoleInteractively() {
  const rl = createReadlineInterface();

  return new Promise((resolve) => {
    console.log(`\\n${colors.bold}Select a role to test:${colors.reset}`);
    console.log(`\\n${colors.magenta}System Level Roles:${colors.reset}`);
    console.log('1. system-admin (Full system administration)');
    console.log('2. ifla-admin (IFLA organization admin)');

    console.log(`\\n${colors.magenta}Namespace Level Roles:${colors.reset}`);
    console.log('3. namespace-admin (Full control of namespace)');
    console.log('4. namespace-editor (Edit content across namespace)');
    console.log('5. namespace-reviewer (Review/approve changes)');
    console.log('6. namespace-translator (Translate content)');
    console.log('7. namespace-contributor (Propose changes)');

    console.log(`\\n${colors.magenta}Site Level Roles:${colors.reset}`);
    console.log('8. site-admin (Site administration)');
    console.log('9. site-editor (Edit site content)');
    console.log('10. site-translator (Translate site content)');
    console.log('11. site-contributor (Contribute to site)');

    rl.question('\\nEnter role number (1-11): ', (answer) => {
      const roleMap = {
        1: 'system-admin',
        2: 'ifla-admin',
        3: 'namespace-admin',
        4: 'namespace-editor',
        5: 'namespace-reviewer',
        6: 'namespace-translator',
        7: 'namespace-contributor',
        8: 'site-admin',
        9: 'site-editor',
        10: 'site-translator',
        11: 'site-contributor',
      };

      const role = roleMap[answer.trim()];
      if (role) {
        rl.close();
        resolve(role);
      } else {
        console.log('Invalid selection. Please try again.');
        rl.close();
        resolve(selectRoleInteractively());
      }
    });
  });
}

// Interactive namespace selection
async function selectNamespaceInteractively() {
  const rl = createReadlineInterface();

  return new Promise((resolve) => {
    console.log(`\\n${colors.bold}Select a namespace:${colors.reset}`);

    const namespaceEntries = Object.entries(NAMESPACES);
    namespaceEntries.forEach(([key, value], index) => {
      const sites = value.sites.join(', ');
      const planned = value.plannedSites
        ? ` + ${value.plannedSites} planned`
        : '';
      console.log(`${index + 1}. ${key} - ${value.name} (${sites}${planned})`);
    });

    rl.question(
      `\\nEnter namespace number (1-${namespaceEntries.length}): `,
      (answer) => {
        const index = parseInt(answer.trim()) - 1;
        if (index >= 0 && index < namespaceEntries.length) {
          const namespace = namespaceEntries[index][0];
          rl.close();
          resolve(namespace);
        } else {
          console.log('Invalid selection. Please try again.');
          rl.close();
          resolve(selectNamespaceInteractively());
        }
      },
    );
  });
}

// Interactive site selection
async function selectSiteInteractively() {
  const rl = createReadlineInterface();
  const sites = getAllSites();

  return new Promise((resolve) => {
    console.log(`\\n${colors.bold}Select a site:${colors.reset}`);

    sites.forEach((site, index) => {
      // Try to find which namespace this site belongs to
      const namespace = Object.entries(NAMESPACES).find(([_, ns]) =>
        ns.sites.includes(site),
      );
      const nsInfo = namespace ? ` (${namespace[0]} namespace)` : '';
      console.log(`${index + 1}. ${site}${nsInfo}`);
    });

    rl.question(`\\nEnter site number (1-${sites.length}): `, (answer) => {
      const index = parseInt(answer.trim()) - 1;
      if (index >= 0 && index < sites.length) {
        const site = sites[index];
        rl.close();
        resolve(site);
      } else {
        console.log('Invalid selection. Please try again.');
        rl.close();
        resolve(selectSiteInteractively());
      }
    });
  });
}

// Generate mock user configuration
function generateMockUser(role, namespace, site, options = {}) {
  const user = {
    id: `test-${role}-${Date.now()}`,
    roles: ['user'],
    attributes: {
      name: `Test ${role.replace('-', ' ').replace(/\\b\\w/g, (l) => l.toUpperCase())}`,
      email: `test-${role}@ifla.org`,
      github_username: `test-${role}`,
      namespaces: {},
      sites: {},
      languages: options.languages || ['en'],
    },
  };

  // Apply role-specific configuration
  if (role.startsWith('system-') || role === 'ifla-admin') {
    user.roles.push(role);
  } else if (role.startsWith('namespace-')) {
    const roleType = role.replace('namespace-', '');
    if (namespace) {
      user.attributes.namespaces[namespace] = roleType;
    }
    if (options.namespaces) {
      options.namespaces.forEach((ns) => {
        user.attributes.namespaces[ns] = roleType;
      });
    }
  } else if (role.startsWith('site-')) {
    const roleType = role.replace('site-', '');
    if (site) {
      user.attributes.sites[site] = roleType;
    }
    if (options.sites) {
      options.sites.forEach((s) => {
        user.attributes.sites[s] = roleType;
      });
    }
  }

  return user;
}

// Test permissions with Cerbos
async function testPermissions(user, namespace, site) {
  log('Testing permissions with Cerbos...');

  try {
    // Import Cerbos client dynamically to avoid issues if not available
    const cerbos = (await import('../apps/admin/src/lib/cerbos.ts')).default;

    const principal = {
      id: user.id,
      roles: user.roles,
      attributes: user.attributes,
    };

    // Test scenarios based on role
    const testScenarios = [];

    if (namespace) {
      testScenarios.push({
        name: `Namespace ${namespace} management`,
        resource: {
          kind: 'namespace',
          id: namespace,
          attributes: { namespace, visibility: 'public' },
        },
        actions: ['view', 'edit', 'manage'],
      });
    }

    if (site) {
      const siteNamespace =
        Object.entries(NAMESPACES).find(([_, ns]) =>
          ns.sites.includes(site),
        )?.[0] || 'UNKNOWN';

      testScenarios.push({
        name: `Site ${site} management`,
        resource: {
          kind: 'site',
          id: site,
          attributes: {
            siteKey: site,
            namespace: siteNamespace,
            visibility: 'public',
          },
        },
        actions: ['view', 'edit', 'manage', 'configure'],
      });
    }

    // Test user admin permissions
    testScenarios.push({
      name: 'User administration',
      resource: {
        kind: 'user_admin',
        id: 'test_admin',
        attributes: {
          scope: namespace ? 'namespace' : site ? 'site' : 'system',
          namespace: namespace,
          siteKey: site,
        },
      },
      actions: ['view_users', 'assign_roles'],
    });

    console.log(
      `\n${colors.cyan}=== PERMISSION TEST RESULTS ===${colors.reset}`,
    );

    for (const scenario of testScenarios) {
      try {
        const result = await cerbos.checkResource({
          principal,
          resource: scenario.resource,
          actions: scenario.actions,
        });

        console.log(`\n${colors.bold}${scenario.name}:${colors.reset}`);
        for (const action of scenario.actions) {
          const isAllowed = result.isAllowed(action);
          const status = isAllowed
            ? `${colors.green}✓ ALLOWED${colors.reset}`
            : `${colors.red}✗ DENIED${colors.reset}`;
          console.log(`  ${action}: ${status}`);
        }
      } catch (err) {
        console.log(`\n${colors.bold}${scenario.name}:${colors.reset}`);
        console.log(`  ${colors.red}ERROR: ${err.message}${colors.reset}`);
      }
    }
  } catch (err) {
    warning(`Permission testing failed: ${err.message}`);
    warning('Continuing without permission validation...');
  }
}

// Display selected configuration
async function displayConfiguration(role, namespace, site, user) {
  console.log(
    `\\n${colors.bold}=== ROLE TESTING CONFIGURATION ===${colors.reset}`,
  );
  console.log(`${colors.green}Role:${colors.reset} ${role}`);
  console.log(
    `${colors.green}Description:${colors.reset} ${ROLES[role]?.description || 'Custom role'}`,
  );
  console.log(
    `${colors.green}Level:${colors.reset} ${ROLES[role]?.level || 'custom'}`,
  );
  console.log(
    `${colors.green}Scope:${colors.reset} ${ROLES[role]?.scope || 'varies'}`,
  );

  if (namespace) {
    console.log(
      `${colors.green}Namespace:${colors.reset} ${namespace} (${NAMESPACES[namespace]?.name || 'Unknown'})`,
    );
  }

  if (site) {
    console.log(`${colors.green}Site:${colors.reset} ${site}`);
  }

  console.log(`\\n${colors.cyan}Generated Mock User:${colors.reset}`);
  console.log(JSON.stringify(user, null, 2));

  // Test permissions with Cerbos
  await testPermissions(user, namespace, site);

  console.log(
    `\\n${colors.bold}=== STARTING TEST ENVIRONMENT ===${colors.reset}`,
  );
}

// Helper functions for demo setup
function getSitePort(siteKey) {
  const portMap = {
    portal: 3000,
    isbdm: 3001,
    lrm: 3002,
    frbr: 3003,
    isbd: 3004,
    muldicat: 3005,
    unimarc: 3006,
    newtest: 3008,
  };
  return portMap[siteKey] || 3008;
}

function generateAuthenticationUrl(user, role, targetSite) {
  // For site-specific roles, create URL that pre-authenticates and redirects to site management
  if (role.includes('site-')) {
    const sitePort = getSitePort(targetSite);
    const siteUrl = `http://localhost:${sitePort}/${targetSite}/`;

    // Create admin portal URL that will authenticate and redirect to site management
    const mockUserParam = encodeURIComponent(JSON.stringify(user));
    const managementUrl = `http://localhost:3007/dashboard/${targetSite}`;
    return `http://localhost:3007/auth/signin?mockUser=${mockUserParam}&callbackUrl=${encodeURIComponent(managementUrl)}`;
  }

  // For namespace or system roles, go to general dashboard
  const mockUserParam = encodeURIComponent(JSON.stringify(user));
  const dashboardUrl = 'http://localhost:3007/dashboard';
  return `http://localhost:3007/auth/signin?mockUser=${mockUserParam}&callbackUrl=${encodeURIComponent(dashboardUrl)}`;
}

function displayTestingInstructions(user, role, targetSite) {
  success('🎯 ROLE-BASED TESTING ENVIRONMENT READY!');
  console.log();

  log('📋 TESTING SCENARIO:');
  console.log(
    `  ${colors.green}•${colors.reset} User is pre-authenticated as: ${colors.cyan}${user.attributes.name}${colors.reset}`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} Role: ${colors.yellow}${role}${colors.reset}`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} Expected behavior: ${getExpectedBehavior(role, targetSite)}`,
  );
  console.log();

  if (role.includes('site-')) {
    log('🎯 SITE-ADMIN WORKFLOW:');
    console.log(
      `  ${colors.green}1.${colors.reset} Browser should open directly to: ${colors.blue}${targetSite} management interface${colors.reset}`,
    );
    console.log(
      `  ${colors.green}2.${colors.reset} User should ${colors.yellow}skip the portal${colors.reset} and land on site-specific admin`,
    );
    console.log(
      `  ${colors.green}3.${colors.reset} Verify the "Manage Site" functionality works correctly`,
    );
  } else if (role.includes('namespace-')) {
    log('🎯 NAMESPACE-ADMIN WORKFLOW:');
    console.log(
      `  ${colors.green}1.${colors.reset} Browser should open to: ${colors.blue}admin dashboard${colors.reset}`,
    );
    console.log(
      `  ${colors.green}2.${colors.reset} User should see sites within their namespace scope`,
    );
    console.log(
      `  ${colors.green}3.${colors.reset} Verify access to multiple sites in the namespace`,
    );
  } else {
    log('🎯 SYSTEM-ADMIN WORKFLOW:');
    console.log(
      `  ${colors.green}1.${colors.reset} Browser should open to: ${colors.blue}full admin dashboard${colors.reset}`,
    );
    console.log(
      `  ${colors.green}2.${colors.reset} User should see all sites and namespaces`,
    );
    console.log(
      `  ${colors.green}3.${colors.reset} Verify full system management capabilities`,
    );
  }

  console.log();
  log('🔧 WHAT TO TEST:');
  console.log(
    `  ${colors.green}•${colors.reset} Authentication flow (should be seamless)`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} Landing page accuracy (correct destination)`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} Permission boundaries (what user can/cannot access)`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} Navigation between admin portal and sites`,
  );
  console.log();

  warning('Press Ctrl+C to stop the testing environment');
}

function getExpectedBehavior(role, targetSite) {
  if (role.includes('site-admin')) {
    return `Direct redirect to ${targetSite} management interface (skip portal)`;
  } else if (role.includes('site-')) {
    return `Direct access to ${targetSite} with limited permissions`;
  } else if (role.includes('namespace-')) {
    return 'Dashboard with namespace-scoped site access';
  } else {
    return 'Full dashboard with access to all sites and namespaces';
  }
}

// Helper function for URL checking
async function checkUrl(url, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (e) {
      // URL not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  return false;
}

// Open URL in browser
async function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open -a "Google Chrome" "${url}"`;
  } else if (platform === 'win32') {
    command = `start chrome "${url}"`;
  } else {
    command = `google-chrome "${url}" || chromium-browser "${url}" || chromium "${url}"`;
  }

  try {
    await execAsync(command);
  } catch (e) {
    warning(`Could not open Chrome automatically. Please visit: ${url}`);
    try {
      if (platform === 'darwin') {
        await execAsync(`open "${url}"`);
      } else if (platform === 'win32') {
        await execAsync(`start "${url}"`);
      } else {
        await execAsync(`xdg-open "${url}"`);
      }
    } catch (e2) {
      warning(`Could not open any browser. Please manually visit: ${url}`);
    }
  }
}

// Start the demo with mock authentication and intelligent routing
async function startDemo(user, role, namespace, site) {
  log('Setting up mock authentication...');

  // Set environment variables for mock auth
  process.env.MOCK_AUTH_USER = JSON.stringify(user);
  process.env.NODE_ENV = 'development';
  process.env.USE_MOCK_AUTH = 'true';

  // Determine which site to start based on user role
  let targetSite = 'newtest'; // Default for testing
  let shouldStartMultipleSites = false;

  if (role.includes('site-') && site) {
    targetSite = site;
    log(`Starting ${targetSite} site for site-specific role testing...`);
  } else if (role.includes('namespace-') && namespace) {
    // For namespace roles, might start multiple sites or show portal
    const namespaceSites = NAMESPACES[namespace]?.sites || [];
    if (namespaceSites.length === 1) {
      targetSite = namespaceSites[0];
      log(`Starting ${targetSite} site for ${namespace} namespace...`);
    } else {
      shouldStartMultipleSites = true;
      log(`Starting portal for ${namespace} namespace with multiple sites...`);
    }
  } else if (role.includes('system-') || role === 'ifla-admin') {
    shouldStartMultipleSites = true;
    log('Starting portal for system-level role...');
  }

  try {
    // Clean up any existing processes
    await execAsync('pnpm ports:kill').catch(() => {});

    // Start admin portal
    log('Starting admin portal...');
    const adminProcess = spawn('nx', ['serve', 'admin'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let siteProcess;
    let portalProcess;

    if (shouldStartMultipleSites) {
      // Start portal for multi-site management
      log('Starting portal for multi-site management...');
      portalProcess = spawn('nx', ['start', 'portal'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, DOCS_ENV: 'local' },
      });
    } else {
      // Start specific site
      log(`Starting ${targetSite} site...`);
      siteProcess = spawn('nx', ['start', targetSite], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, DOCS_ENV: 'local' },
      });
    }

    // Handle cleanup on exit
    const cleanup = () => {
      log('Cleaning up demo environment...');
      adminProcess.kill();
      if (siteProcess) siteProcess.kill();
      if (portalProcess) portalProcess.kill();
      delete process.env.MOCK_AUTH_USER;
      delete process.env.USE_MOCK_AUTH;
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Wait for admin portal to be ready
    log('Waiting for admin portal to start...');
    const adminReady = await checkUrl('http://localhost:3007');
    console.log(); // New line after dots

    if (!adminReady) {
      error('Admin portal failed to start after 30 seconds');
      cleanup();
      return;
    }
    success('Admin portal is ready at http://localhost:3007');

    // Wait for site/portal to be ready
    if (shouldStartMultipleSites) {
      log('Waiting for portal to start...');
      const portalReady = await checkUrl('http://localhost:3000');
      console.log();

      if (!portalReady) {
        error('Portal failed to start after 30 seconds');
        cleanup();
        return;
      }
      success('Portal is ready at http://localhost:3000');
    } else {
      const sitePort = getSitePort(targetSite);
      const siteUrl = `http://localhost:${sitePort}/${targetSite}/`;

      log(`Waiting for ${targetSite} site to start...`);
      const siteReady = await checkUrl(siteUrl);
      console.log();

      if (!siteReady) {
        error(`${targetSite} site failed to start after 30 seconds`);
        cleanup();
        return;
      }
      success(`${targetSite} site is ready at ${siteUrl}`);
    }

    // Generate the appropriate authentication URL
    const authUrl = generateAuthenticationUrl(
      user,
      role,
      shouldStartMultipleSites ? 'portal' : targetSite,
    );

    // Open browser with pre-authentication
    log('Opening browser with pre-authenticated session...');
    await openBrowser(authUrl);

    // Display instructions
    displayTestingInstructions(
      user,
      role,
      shouldStartMultipleSites ? 'portal' : targetSite,
    );

    // Keep processes running
    await new Promise(() => {}); // Run forever until interrupted
  } catch (err) {
    error(`Failed to start demo: ${err.message}`);
    process.exit(1);
  }
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  highlight('IFLA Standards Admin Portal Role Testing Tool');
  console.log(
    'This tool allows you to test different user roles and permissions\\n',
  );

  let role, namespace, site;

  if (options.interactive) {
    // Interactive mode
    role = await selectRoleInteractively();

    if (ROLES[role]?.level === 'namespace' || role.includes('namespace')) {
      namespace = await selectNamespaceInteractively();
    } else if (ROLES[role]?.level === 'site' || role.includes('site')) {
      site = await selectSiteInteractively();
    }
  } else {
    // Command-line mode
    role = options.role;
    namespace = options.namespace;
    site = options.site;

    // Validate role
    if (!role || !ROLES[role]) {
      error(`Invalid role: ${role}`);
      error('Use --help to see available roles');
      process.exit(1);
    }

    // Validate namespace if needed
    if (
      (role.includes('namespace') || namespace) &&
      namespace &&
      !NAMESPACES[namespace]
    ) {
      error(`Invalid namespace: ${namespace}`);
      error('Available namespaces: ' + Object.keys(NAMESPACES).join(', '));
      process.exit(1);
    }

    // Validate site if needed
    const allSites = getAllSites();
    if ((role.includes('site') || site) && site && !allSites.includes(site)) {
      error(`Invalid site: ${site}`);
      error('Available sites: ' + allSites.join(', '));
      process.exit(1);
    }
  }

  // Generate mock user
  const mockUser = generateMockUser(role, namespace, site, {
    namespaces: options.namespaces,
    sites: options.sites,
  });

  // Display configuration
  await displayConfiguration(role, namespace, site, mockUser);

  // Start demo with role-based routing
  await startDemo(mockUser, role, namespace, site);
}

// Run the script
if (require.main === module) {
  main().catch(error);
}
