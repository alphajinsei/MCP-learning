# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an MCP (Model Context Protocol) learning repository containing two educational MCP server implementations.

## Project Structure

```
MCP/
├── mcp-weather-server/     # Weather information server
├── mcp-memo-server/        # Memo management server
├── .mcp.json               # MCP configuration file
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## MCP Servers

### 1. mcp-weather-server
- **Purpose**: Educational sample demonstrating all 3 MCP core features
- **Features**:
  - Tools: `get_weather` (fetches weather data from Open-Meteo API)
  - Resources: `weather://cities` (list of supported cities)
  - Prompts: `compare-weather` (template for comparing weather)
- **Technology**: Node.js, MCP SDK, Open-Meteo API
- **Level**: Beginner to Intermediate

### 2. mcp-memo-server
- **Purpose**: Stateful MCP server with CRUD operations
- **Features**:
  - Tools: `create_memo`, `read_memo`, `update_memo`, `delete_memo`
  - Data persistence: JSON file storage
- **Technology**: Node.js, MCP SDK, File I/O
- **Level**: Intermediate

## Working Context

- **Runtime**: Node.js (v16+)
- **Package Manager**: npm
- **Protocol**: JSON-RPC 2.0 over stdio
- **MCP SDK**: `@modelcontextprotocol/sdk`

## Development Guidelines

### Testing MCP Servers

Use JSON-RPC messages via stdin to test servers directly:

```bash
# Example: Test tools/list
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-weather-server/index.js
```

### Git Workflow

- Commit messages should be in Japanese
- Use descriptive commit messages with Claude Code attribution
- Always include `.gitignore` for `node_modules/`, `.env`, etc.

### Code Style

- Use ES6 modules (`import`/`export`)
- Async/await for asynchronous operations
- Descriptive variable and function names in English
- Comments in Japanese for educational clarity

## Key Learning Topics

This repository demonstrates:
- MCP server initialization and configuration
- Tools, Resources, and Prompts implementation
- JSON-RPC 2.0 protocol handling
- External API integration
- File-based data persistence
- Error handling patterns
- Custom URI schemes for resources
- Dynamic prompt generation

## Testing

Each server can be tested independently:
1. Navigate to server directory
2. Run `npm install`
3. Test using JSON-RPC commands via echo/pipe
4. Or integrate with Claude Desktop/Code using `.mcp.json`

## Documentation

Each server has its own comprehensive README.md with:
- Feature descriptions
- Setup instructions
- Usage examples
- Learning points
- Troubleshooting guides
- JSON-RPC testing examples
