# Claude Code Setup

This repository includes configuration for enhanced Claude Code functionality through MCP (Model Context Protocol) servers.

## Setup Instructions

### 1. Copy settings template
```bash
cp settings.json.example settings.json
```

### 2. Configure your settings
Edit `settings.json` and update:

- **nx-mcp workspace path**: Update the path to your workspace:
  ```json
  "/path/to/your/workspace"
  ```
  Should be:
  ```json
  "/Users/[your-username]/Code/IFLA/standards-dev"
  ```

- **Perplexity API Key** (optional): If you want to use Perplexity search:
  ```json
  "PERPLEXITY_API_KEY": "your-api-key-here"
  ```
  Get your API key from: https://www.perplexity.ai/settings/api

### 3. Configured MCP Servers

The setup includes these MCP servers for enhanced development:

- **Context7**: Documentation and code examples from community packages
- **puppeteer-real-browser**: Browser automation for testing and debugging
- **nx-mcp**: Nx monorepo integration and workspace management
- **perplexity-ask**: AI-powered search and research capabilities
- **playwright**: End-to-end testing framework integration

### 4. Security Note

⚠️ **Important**: Never commit `settings.json` to the repository as it contains API keys.

The file is already in `.gitignore` to prevent accidental commits.

## Usage

Once configured, these MCP servers provide enhanced capabilities when using Claude Code:

- **Nx Commands**: `nx build`, `nx test`, `nx affected`, etc.
- **Playwright Testing**: Browser automation and E2E test execution
- **Context7 Examples**: Real-time code examples and documentation
- **Perplexity Search**: Enhanced research capabilities
- **Browser Automation**: Puppeteer integration for testing

## Troubleshooting

If MCP servers fail to start:

1. **Check paths**: Ensure workspace path in nx-mcp is correct
2. **API keys**: Verify Perplexity API key if using that server
3. **Dependencies**: MCP servers are installed via npx automatically
4. **Permissions**: Ensure Claude Code has necessary permissions

For more information about MCP servers, see: https://docs.anthropic.com/claude/docs/mcp