#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Parse command line arguments
const args = process.argv.slice(2);
const serviceIndex = args.findIndex(arg => arg === '--service');
const envIndex = args.findIndex(arg => arg === '--env');
const urlIndex = args.findIndex(arg => arg === '--url');
const tokenIndex = args.findIndex(arg => arg === '--token');

const service = serviceIndex !== -1 ? args[serviceIndex + 1] : null;
const env = envIndex !== -1 ? args[envIndex + 1] : 'preview';
const customUrl = urlIndex !== -1 ? args[urlIndex + 1] : null;
const token = tokenIndex !== -1 ? args[tokenIndex + 1] : process.env.GITHUB_TOKEN;

if (!service) {
  console.error('❌ Please specify a service with --service <name>');
  console.error('Available services: supabase, clerk, github, vercel, check-supabase, check-clerk, check-github');
  process.exit(1);
}

console.log(`🏥 Running health check for ${service}...`);

// Service configurations
const services = {
  supabase: {
    name: 'Supabase',
    check: checkSupabase
  },
  'check-supabase': {
    name: 'Supabase',
    check: checkSupabase
  },
  clerk: {
    name: 'Clerk Auth',
    check: checkClerk
  },
  'check-clerk': {
    name: 'Clerk Auth',
    check: checkClerk
  },
  github: {
    name: 'GitHub API',
    check: checkGitHub
  },
  'check-github': {
    name: 'GitHub API',
    check: checkGitHub
  },
  vercel: {
    name: 'Vercel',
    check: checkVercel
  }
};

// Run the appropriate health check
if (services[service]) {
  services[service].check()
    .then(result => {
      if (result.success) {
        console.log(`✅ ${services[service].name} is healthy`);
        if (result.details) {
          console.log(`   Details: ${result.details}`);
        }
        // Output JSON result for parsing
        console.log(JSON.stringify(result));
        process.exit(0);
      } else {
        console.error(`❌ ${services[service].name} health check failed`);
        console.error(`   Error: ${result.error}`);
        // Output JSON result for parsing
        console.log(JSON.stringify(result));
        process.exit(1);
      }
    })
    .catch(err => {
      console.error(`❌ Unexpected error: ${err.message}`);
      console.log(JSON.stringify({ success: false, error: err.message }));
      process.exit(1);
    });
} else {
  console.error(`❌ Unknown service: ${service}`);
  process.exit(1);
}

// Health check functions
async function checkSupabase() {
  const supabaseUrl = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    return {
      success: false,
      error: 'NEXT_PUBLIC_SUPABASE_URL not configured'
    };
  }
  
  try {
    // Check if we can reach the Supabase instance
    const url = new URL('/rest/v1/', supabaseUrl);
    const response = await makeRequest(url.href, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'
      }
    });
    
    // Supabase typically returns 200 or 401 for the base API endpoint
    if (response.statusCode === 200 || response.statusCode === 401 || response.statusCode === 400) {
      return {
        success: true,
        details: `API endpoint reachable (status: ${response.statusCode})`,
        url: supabaseUrl
      };
    } else {
      return {
        success: false,
        error: `Unexpected status code: ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkClerk() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkKey) {
    return {
      success: false,
      error: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not configured'
    };
  }
  
  try {
    // Extract the Clerk instance from the publishable key
    // Format: pk_test_XXX or pk_live_XXX
    const keyParts = clerkKey.split('_');
    if (keyParts.length < 3) {
      return {
        success: false,
        error: 'Invalid Clerk publishable key format'
      };
    }
    
    const isProduction = keyParts[1] === 'live';
    const instance = keyParts.slice(2).join('_').split('.')[0];
    
    // Check Clerk's JWKS endpoint
    const clerkDomain = `https://${instance}.clerk.accounts.dev`;
    const jwksUrl = `${clerkDomain}/.well-known/jwks.json`;
    
    const response = await makeRequest(jwksUrl);
    
    if (response.statusCode === 200) {
      return {
        success: true,
        details: `Clerk instance verified (${isProduction ? 'production' : 'test'} mode)`,
        instance: instance
      };
    } else {
      return {
        success: false,
        error: `Failed to reach Clerk instance (status: ${response.statusCode})`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkGitHub() {
  const githubToken = token || process.env.GITHUB_TOKEN || process.env.AUTH_GITHUB_SECRET;
  
  if (!githubToken) {
    return {
      success: false,
      error: 'No GitHub token available (GITHUB_TOKEN or AUTH_GITHUB_SECRET)'
    };
  }
  
  try {
    // Test GitHub API access
    const response = await makeRequest('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'IFLA-Standards-Platform'
      }
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      return {
        success: true,
        details: `Authenticated as ${data.login || 'GitHub App'}`,
        scopes: response.headers['x-oauth-scopes'] || 'app'
      };
    } else if (response.statusCode === 401) {
      return {
        success: false,
        error: 'Invalid or expired GitHub token'
      };
    } else {
      return {
        success: false,
        error: `GitHub API error (status: ${response.statusCode})`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkVercel() {
  // For Vercel, we'll check if the deployment endpoint is accessible
  // This would typically be done through the Vercel API
  const vercelToken = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  
  if (!vercelToken || !projectId) {
    return {
      success: false,
      error: 'Vercel configuration missing (VERCEL_TOKEN or VERCEL_PROJECT_ID)'
    };
  }
  
  try {
    const response = await makeRequest(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      return {
        success: true,
        details: `Project "${data.name}" found`,
        framework: data.framework
      };
    } else if (response.statusCode === 401) {
      return {
        success: false,
        error: 'Invalid Vercel token'
      };
    } else if (response.statusCode === 404) {
      return {
        success: false,
        error: 'Vercel project not found'
      };
    } else {
      return {
        success: false,
        error: `Vercel API error (status: ${response.statusCode})`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to make HTTP/HTTPS requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000 // 10 second timeout
    };
    
    const req = protocol.request(reqOptions, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}