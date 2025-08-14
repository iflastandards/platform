#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

const urls = [
  'http://localhost:3000',                // Portal
  'http://localhost:3001/ISBDM/',         // ISBDM
  'http://localhost:3002/LRM/',           // LRM
  'http://localhost:3003/FRBR/',          // FRBR
  'http://localhost:3004/isbd/',          // ISBD
  'http://localhost:3005/muldicat/',      // Muldicat
  'http://localhost:3006/unimarc/',       // UNIMARC
  'http://localhost:3007'                 // Admin
];

function openChromeWithDevTools() {
  const platform = os.platform();
  let chromeCommand;

  switch (platform) {
    case 'darwin': // macOS
      chromeCommand = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';
      break;
    case 'win32': // Windows
      chromeCommand = 'start chrome';
      break;
    case 'linux':
      chromeCommand = 'google-chrome';
      break;
    default:
      console.error('Unsupported platform:', platform);
      process.exit(1);
  }

  // Build the command with all URLs and developer tools flag
  const devToolsFlag = '--auto-open-devtools-for-tabs';
  const urlsString = urls.join(' ');
  
  let fullCommand;
  if (platform === 'win32') {
    fullCommand = `${chromeCommand} ${devToolsFlag} ${urlsString}`;
  } else {
    fullCommand = `${chromeCommand} ${devToolsFlag} ${urlsString}`;
  }

  console.log('🚀 Opening Chrome with Developer Tools...');
  console.log('📍 URLs:', urls.join(', '));

  exec(fullCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error opening Chrome:', error);
      // Try without dev tools flag as fallback
      const fallbackCommand = platform === 'win32' 
        ? `${chromeCommand} ${urlsString}`
        : `${chromeCommand} ${urlsString}`;
      
      exec(fallbackCommand, (err) => {
        if (err) {
          console.error('Failed to open Chrome:', err);
        }
      });
    }
  });
}

// Wait a bit for servers to start before opening browser
const delay = process.argv[2] ? parseInt(process.argv[2]) : 5000;

console.log(`⏳ Waiting ${delay/1000} seconds for servers to start...`);
setTimeout(openChromeWithDevTools, delay);