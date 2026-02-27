export interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

// ─── GETTING STARTED ─────────────────────────────────────────────────────────

const gettingStarted = `# Getting Started

Harbinger is an **autonomous offensive security framework** — a local-first, MCP-powered, multi-agent platform for bug bounty hunters, red teams, and security researchers.

## What You Get

- **11 AI agents** — PATHFINDER (recon), BREACH (web), PHANTOM (cloud), SPECTER (OSINT), CIPHER (binary), SCRIBE (reports), SAM (coding), BRIEF (reporter), SAGE (learning), LENS (browser), MAINTAINER (code health)
- **150+ security tools** via 4 MCP plugin servers
- **19 UI pages** — Dashboard, Command Center, Chat, Agents, Workflows, Workflow Editor, MCP Manager, Docker, Browser, Red Team, Bounty Hub, Skills Hub, OpenClaw, Code Health, Scope Manager, Vuln Deep Dive, Remediation, Autonomous Intelligence, Settings
- **Autonomous Intelligence** — background thinking loops, swarm awareness, efficiency tracking, meta-cognition
- **9 Docker services** — PostgreSQL, Redis, Neo4j, Go backend, React frontend, HexStrike, PentAGI, RedTeam, Nginx

## Quick Start

\`\`\`bash
git clone https://github.com/Haribinger/Harbinger.git
cd Harbinger
cp .env.example .env   # Edit with your GitHub OAuth keys
docker compose up -d   # Starts all 9 services
\`\`\`

Open **http://localhost:3000** and log in with GitHub.

## Architecture Overview

\`\`\`
HARBINGER COMMAND CENTER
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│PATHFINDER│ │  BREACH  │ │ PHANTOM  │ │ SPECTER  │ │  CIPHER  │ │  SCRIBE  │
│  Recon   │ │ Web Hack │ │  Cloud   │ │  OSINT   │ │Binary RE │ │ Reports  │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
                              AGENT ORCHESTRATOR
     ┌──────────────┬──────────────┬──────────────┬──────────────┐
     │   MCP        │   Docker     │  Knowledge   │    Git       │
     │  Servers     │  Containers  │   Graph      │   Memory     │
     └──────────────┴──────────────┴──────────────┴──────────────┘
\`\`\`
`;

// ─── INSTALLATION ────────────────────────────────────────────────────────────

const installation = `# Installation

## Prerequisites

- **Docker** and **Docker Compose** (v2+)
- **Git**
- **GitHub OAuth App** (for login — or use Device Flow / PAT)

## Clone the Repository

\`\`\`bash
git clone https://github.com/Haribinger/Harbinger.git
cd Harbinger
\`\`\`

## Environment Configuration

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` with your values:

| Variable | Required | Description |
|----------|----------|-------------|
| \`GITHUB_CLIENT_ID\` | Yes | GitHub OAuth App client ID |
| \`GITHUB_CLIENT_SECRET\` | Yes | GitHub OAuth App client secret |
| \`JWT_SECRET\` | Yes | Secret for JWT tokens (min 32 chars) |
| \`DB_PASSWORD\` | Yes | PostgreSQL password |
| \`NEO4J_PASSWORD\` | Yes | Neo4j graph database password |
| \`APP_URL\` | No | Frontend URL (default: \`http://localhost:3000\`) |
| \`GH_TOKEN\` | No | GitHub PAT for token-based auth |

## Start the Stack

\`\`\`bash
docker compose up -d
\`\`\`

This starts **10 containers**:

| Service | Port | Role |
|---------|------|------|
| PostgreSQL | 5432 | Primary database (pgvector) |
| Redis | 6379 | Cache and sessions |
| Neo4j | 7474, 7687 | Knowledge graph |
| Go Backend | 8080 | API server (44+ routes) |
| React Frontend | 3000 | SPA with 14 pages |
| HexStrike | 3001 | 150+ security tools MCP |
| PentAGI | 3002 | Autonomous agent MCP |
| MCP-UI | 3003 | Visualization MCP |
| RedTeam | 3004 | Red team operations MCP |
| Nginx | 80, 443 | Reverse proxy |

## Verify Health

\`\`\`bash
# Check all containers
docker compose ps

# Test backend
curl http://localhost:8080/api/health

# Test frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
\`\`\`

## Local Development (Without Docker)

\`\`\`bash
# Backend
cd backend && go run ./cmd/

# Frontend (separate terminal)
pnpm dev  # Starts Vite dev server on :3000
\`\`\`

All ports are configurable via environment variables — see Configuration docs.
`;

// ─── CONFIGURATION ───────────────────────────────────────────────────────────

const configuration = `# Configuration

All Harbinger configuration is done through environment variables. In Docker, these are set in \`.env\` and loaded by \`docker-compose.yml\`.

## Port Configuration

Every service port is configurable:

| Variable | Default | Service |
|----------|---------|---------|
| \`APP_PORT\` | 8080 | Go backend |
| \`FRONTEND_PORT\` | 3000 | React frontend |
| \`DB_PORT\` | 5432 | PostgreSQL |
| \`REDIS_PORT\` | 6379 | Redis |
| \`NEO4J_HTTP_PORT\` | 7474 | Neo4j HTTP |
| \`NEO4J_BOLT_PORT\` | 7687 | Neo4j Bolt |
| \`HEXSTRIKE_PORT\` | 3001 | HexStrike MCP |
| \`PENTAGI_PORT\` | 3002 | PentAGI MCP |
| \`MCP_UI_PORT\` | 3003 | MCP-UI |
| \`REDTEAM_PORT\` | 3004 | RedTeam MCP |
| \`NGINX_HTTP_PORT\` | 80 | Nginx HTTP |
| \`NGINX_HTTPS_PORT\` | 443 | Nginx HTTPS |
| \`METRICS_PORT\` | 9090 | Prometheus metrics |

## Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| \`DB_HOST\` | localhost | PostgreSQL host |
| \`DB_PORT\` | 5432 | PostgreSQL port |
| \`DB_NAME\` | harbinger | Database name |
| \`DB_USER\` | harbinger | Database user |
| \`DB_PASSWORD\` | change-me | Database password |
| \`REDIS_HOST\` | localhost | Redis host |
| \`NEO4J_HOST\` | localhost | Neo4j host |
| \`NEO4J_PASSWORD\` | neo4j-change-me | Neo4j password |

## Application Settings

| Variable | Default | Description |
|----------|---------|-------------|
| \`APP_NAME\` | Harbinger | Application name |
| \`APP_ENV\` | development | Environment (development/production) |
| \`LOG_LEVEL\` | info | Log level |
| \`MCP_ENABLED\` | true | Enable MCP plugin connections |
| \`DOCKER_SOCKET\` | /var/run/docker.sock | Docker socket path |

## Vite Proxy Configuration

In development, the Vite dev server proxies API requests:

- \`/api/*\` → backend on :8080
- \`/health\` → backend on :8080
- \`/ws\` → WebSocket on :8080
- \`/mcp/hexstrike/*\` → HexStrike on :3001
- \`/mcp/pentagi/*\` → PentAGI on :3002
- \`/mcp/ui/*\` → MCP-UI on :3003
- \`/api/redteam/*\` → RedTeam on :3004

In Docker production, the same proxying is done by the frontend container's nginx and the main nginx reverse proxy.
`;

// ─── AGENTS ──────────────────────────────────────────────────────────────────

const agents = `# Agents

Harbinger ships with 11 specialized AI agents. Each agent has its own Docker container profile, tool set, personality, and autonomous thinking loop.

## Agent Roster

| Codename | Role | Primary Tools |
|----------|------|---------------|
| **PATHFINDER** | Recon Scout | subfinder, httpx, naabu, shef, ceye |
| **BREACH** | Web Hacker | nuclei, sqlmap, dalfox, ffuf, recx |
| **PHANTOM** | Cloud Infiltrator | ScoutSuite, Prowler, Pacu |
| **SPECTER** | OSINT Detective | theHarvester, Sherlock, SpiderFoot |
| **CIPHER** | Binary RE | Ghidra, radare2, pwntools |
| **SCRIBE** | Report Writer | Markdown, PDF, platform APIs |
| **SAM** | Coding Specialist | eslint, gofmt, TypeScript, Go, Python |
| **BRIEF** | Morning Reporter | RSS, web scraping, content generation |
| **SAGE** | Learning Agent | workflow optimization, self-improvement |
| **LENS** | Browser Agent | CDP navigate, screenshot, execute JS |
| **MAINTAINER** | Code Health | health scans, dependency audit, safe fixes |

## Autonomous Intelligence

Every agent runs a background thinking loop (autonomous-engine.js) that:
- Analyzes context every 60 seconds
- Scans 5 dimensions: performance, accuracy, cost, automation, collaboration
- Calculates efficiency: \\\`COST_BENEFIT = (TIME_SAVED * FREQUENCY) / (IMPL_COST + RUNNING_COST)\\\`
- Only surfaces proposals where cost_benefit > 1.0
- Reports thoughts to the swarm API for operator approval

## Agent Configuration

Each agent has a \`CONFIG.yaml\` in \`agents/<name>/\`:

\`\`\`yaml
name: PATHFINDER
role: Recon Scout
description: "Subdomain enumeration, port scanning, tech fingerprinting"
docker:
  image: harbinger-agent-recon
  memory_mb: 2048
  cpu_count: 2
capabilities:
  - subdomain_enumeration
  - port_scanning
  - http_probing
  - technology_detection
  - dns_resolution
  - certificate_transparency
  - screenshot_capture
tools:
  - subfinder
  - httpx
  - naabu
  - shef
  - ceye
\`\`\`

## Agent Communication

Agents communicate through a formal handoff protocol:

1. **HANDOFF** — Transfer task to another agent
2. **FINDING** — Share discovered vulnerability
3. **CONTEXT** — Pass contextual information
4. **STATUS** — Report progress updates

All messages are persisted and visible in the Command Center.

## Creating Custom Agents

Use the template at \`agents/_template/\`:

\`\`\`bash
cp -r agents/_template agents/my-agent
# Edit agents/my-agent/CONFIG.yaml
# Edit agents/my-agent/SOUL.md (personality)
\`\`\`
`;

// ─── MCP PLUGINS ─────────────────────────────────────────────────────────────

const mcpPlugins = `# MCP Plugins

Harbinger uses the **Model Context Protocol (MCP)** to expose security tools. Four MCP servers run as Docker containers.

## HexStrike AI (Port 3001)

150+ security tools organized by category:

- **Network**: nmap, masscan, naabu
- **Web**: nuclei, sqlmap, dalfox, ffuf, nikto, dirsearch
- **Recon**: subfinder, httpx, amass
- **Binary**: radare2, binwalk
- **Cloud**: prowler, ScoutSuite
- **OSINT**: theHarvester, sherlock

## PentAGI (Port 3002)

Autonomous agent system for multi-step attack workflows.

## RedTeam (Port 3004)

Red team operations with Neo4j knowledge graph integration. Tracks attack paths, findings, and technique mappings.

## MCP-UI (Port 3003)

Visualization and monitoring server with SSE support for real-time event streams.

## Health Endpoints

All MCP plugins expose:

- \`GET /health\` — Health check (JSON)
- \`GET /healthz\` — Health check (alias)
- \`GET /api/v1/info\` — Service capabilities

## Adding Custom MCP Plugins

1. Create a directory under \`mcp-plugins/\`
2. Add a \`Dockerfile\` and \`server.js\`
3. Expose a health endpoint on your chosen port
4. Add the service to \`docker-compose.yml\`
5. Add proxy rules to \`vite.config.ts\` and \`nginx.conf\`
`;

// ─── API REFERENCE ───────────────────────────────────────────────────────────

const apiReference = `# API Reference

The Go backend exposes 44+ REST API routes on port 8080.

## Public Routes (No Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| \`GET\` | \`/health\` | Health check |
| \`GET\` | \`/api/health\` | Health check (proxied path) |
| \`GET\` | \`/api/setup/status\` | Check if setup is needed |
| \`POST\` | \`/api/setup\` | Run initial setup |
| \`GET\` | \`/api/auth/github\` | Initiate OAuth flow |
| \`GET\` | \`/api/auth/github/callback\` | OAuth callback |
| \`POST\` | \`/api/auth/github/device/start\` | Start device flow |
| \`POST\` | \`/api/auth/github/device/poll\` | Poll device flow |
| \`POST\` | \`/api/auth/github/token\` | PAT login |
| \`GET\` | \`/api/auth/github/token/env\` | Server GH_TOKEN login |

## Protected Routes (Bearer Token Required)

### Agents

| Method | Path | Description |
|--------|------|-------------|
| \`GET\` | \`/api/v1/agents\` | List all agents |
| \`POST\` | \`/api/v1/agents\` | Create agent |
| \`PUT\` | \`/api/v1/agents/{id}\` | Update agent |
| \`DELETE\` | \`/api/v1/agents/{id}\` | Delete agent |
| \`POST\` | \`/api/v1/agents/{id}/heartbeat\` | Agent heartbeat |

### Workflows

| Method | Path | Description |
|--------|------|-------------|
| \`GET\` | \`/api/v1/workflows\` | List workflows |
| \`POST\` | \`/api/v1/workflows\` | Create workflow |
| \`PUT\` | \`/api/v1/workflows/{id}\` | Update workflow |
| \`DELETE\` | \`/api/v1/workflows/{id}\` | Delete workflow |

### Docker

| Method | Path | Description |
|--------|------|-------------|
| \`GET\` | \`/api/docker/containers\` | List containers |
| \`POST\` | \`/api/docker/containers\` | Create container |
| \`POST\` | \`/api/docker/containers/{id}/{action}\` | Container action (start/stop/restart) |
| \`DELETE\` | \`/api/docker/containers/{id}\` | Remove container |
| \`GET\` | \`/api/docker/containers/{id}/logs\` | Container logs |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| \`GET\` | \`/api/dashboard/health\` | Service health status |
| \`GET\` | \`/api/dashboard/stats\` | System statistics |

## Authentication

All protected routes require:

\`\`\`
Authorization: Bearer <jwt-token>
\`\`\`

Tokens are obtained through one of the three auth methods (OAuth, Device Flow, PAT).

## Response Format

All responses follow:

\`\`\`json
{
  "ok": true,
  "data": { ... }
}
\`\`\`

Error responses:

\`\`\`json
{
  "ok": false,
  "error": "human-readable error message"
}
\`\`\`

> **Note:** Error messages are sanitized — internal details are logged server-side only.
`;

// ─── AUTHENTICATION ──────────────────────────────────────────────────────────

const authentication = `# Authentication

Harbinger supports three GitHub-based login methods.

## 1. OAuth (Standard Flow)

Best for development with accessible callback URLs.

1. Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers)
2. Set callback URL to \`http://localhost:3000/api/auth/github/callback\`
3. Set \`GITHUB_CLIENT_ID\` and \`GITHUB_CLIENT_SECRET\` in \`.env\`
4. Click "Continue with GitHub" on the login page

## 2. Device Flow (No Callback URL Needed)

Best for Docker deployments, Windows IIS conflicts, or environments where callback URLs don't work.

1. Set \`GITHUB_CLIENT_ID\` in \`.env\`
2. Click the "Device Flow" tab on the login page
3. Copy the user code and open the verification URL
4. Authorize on GitHub — the app polls automatically

## 3. Personal Access Token (PAT)

Best for headless or automated access.

1. Generate a PAT at [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click the "Token" tab on the login page
3. Paste the token

Or set \`GH_TOKEN\` in \`.env\` for server-side token auth.

## Security Features

- **JWT tokens** with configurable secret (validated at startup in production)
- **OAuth CSRF protection** — server-side state store with TTL
- **TOTP verification** — HMAC-SHA256 with drift window
- **Rate limiting** — per-IP sliding window on auth endpoints
- **Token expiration** — checked on every protected route

## Setup Wizard

On first run, Harbinger shows a 7-step setup wizard:

1. Welcome
2. Database configuration
3. Redis configuration
4. GitHub authentication (OAuth App or PAT required)
5. API key configuration
6. Agent selection
7. Review and deploy

The wizard validates that at least one login method is configured before allowing completion.
`;

// ─── DOCKER ──────────────────────────────────────────────────────────────────

const docker = `# Docker Services

Harbinger runs as 10 Docker containers orchestrated by Docker Compose.

## Service Dependencies

\`\`\`
postgres (healthy) ──┐
redis (healthy) ─────┼──▶ backend (healthy) ──┬──▶ frontend
neo4j (healthy) ─────┘                       ├──▶ hexstrike
                                              ├──▶ pentagi
                                              ├──▶ redteam
                                              ├──▶ mcp-ui
                                              └──▶ nginx
\`\`\`

## Health Checks

Every service has a health check:

| Service | Check | Interval |
|---------|-------|----------|
| PostgreSQL | \`pg_isready\` | 30s |
| Redis | \`redis-cli ping\` | 30s |
| Neo4j | \`wget http://localhost:7474\` | 30s |
| Backend | \`curl http://localhost:8080/api/health\` | 30s |
| Frontend | \`wget http://localhost/index.html\` | 30s |
| MCP Plugins | \`wget http://localhost:{port}/health\` | 30s |

## Volumes

| Volume | Purpose |
|--------|---------|
| \`postgres_data\` | Database persistence |
| \`redis_data\` | Cache persistence |
| \`neo4j_data\` | Knowledge graph persistence |
| \`./config\` | Application config (read-only) |
| \`./skills\` | Skill files (read-only) |
| \`./agents\` | Agent profiles (read-only) |
| \`./mcp-plugins\` | MCP plugin code (read-only) |
| \`./logs\` | Application logs |

## Docker Action Whitelist

The backend restricts Docker container operations to:

- \`start\` / \`stop\` / \`restart\`
- \`pause\` / \`unpause\`
- \`kill\`

Any other action is rejected (prevents path injection attacks).

## Resource Limits

Agent containers have configurable CPU and memory limits defined in their \`CONFIG.yaml\` files.
`;

// ─── SECURITY ────────────────────────────────────────────────────────────────

const security = `# Security

Harbinger is built by security engineers for security engineers. Every layer is audited.

## Authentication & Authorization

- 3 login methods (OAuth, Device Flow, PAT)
- JWT tokens with production secret validation
- OAuth CSRF protection (server-side state store with TTL)
- HMAC-SHA256 TOTP verification with drift window
- Bearer token required on all protected API routes

## API Security

- Sliding-window rate limiting per IP
- Request body size limits (\`maxBodyMiddleware\`)
- Error message sanitization — internal details logged server-side, generic message to client
- CORS enforcement with configurable origin validation
- Security headers via Nginx (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)

## Input Validation

- SQL queries use parameterized placeholders (\`$1, $2, ...\`)
- SQL field names validated via whitelist
- Docker actions restricted to whitelist (start/stop/restart/pause/unpause/kill)
- Skill IDs validated against directory contents
- Setup guard prevents re-running setup after initial configuration

## Infrastructure

- All service ports configurable via environment variables
- No hardcoded secrets in source code
- Production JWT secret validation (warns if using defaults)
- Docker socket access for container management
- Neo4j credentials stored as environment variables

## Frontend Security

- No \`process.env\` (Vite uses \`import.meta.env\`)
- All API calls include Authorization headers
- Backend-down detection with clear user guidance
- Setup wizard requires auth method before completion
- No hardcoded API keys or tokens

## Recommendations for Production

1. Set strong \`JWT_SECRET\` (32+ characters)
2. Set strong \`DB_PASSWORD\` and \`NEO4J_PASSWORD\`
3. Enable HTTPS in Nginx (SSL config is prepared, just uncomment)
4. Set \`APP_ENV=production\`
5. Configure GitHub OAuth App callback URL for your domain
6. Use network policies to restrict inter-container communication
`;

// ─── UI PAGES ────────────────────────────────────────────────────────────────

const uiPages = `# UI Pages

Harbinger's frontend has 19 pages built with React 19, TypeScript, and the Obsidian Command design system.

## Page Overview

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | \`/\` | System overview, agent status, recent activity |
| **Command Center** | \`/command-center\` | Agent orchestration and real-time monitoring |
| **Chat** | \`/chat/:agentId?\` | Direct agent communication |
| **Agents** | \`/agents\` | Agent management and configuration |
| **Workflows** | \`/workflows\` | Workflow list and execution |
| **Workflow Editor** | \`/workflow-editor/:id?\` | Visual graph editor (@xyflow/react) |
| **MCP Manager** | \`/mcp\` | MCP server connections and tool browser |
| **Docker Manager** | \`/docker\` | Container management and logs |
| **Browser Manager** | \`/browsers\` | Headless browser sessions |
| **Red Team** | \`/redteam\` | Red team operations dashboard |
| **Skills Hub** | \`/skills\` | Security skill library |
| **Bounty Hub** | \`/bounty-hub\` | Bug bounty program management |
| **OpenClaw** | \`/openclaw\` | Event bus, voice, command routing |
| **Code Health** | \`/code-health\` | MAINTAINER metrics dashboard |
| **Scope Manager** | \`/scope-manager\` | In-scope/out-of-scope asset management |
| **Vuln Deep Dive** | \`/vuln-deep-dive\` | Vulnerability analysis and triage |
| **Remediation** | \`/remediation\` | Kanban vulnerability fix tracker |
| **Autonomous** | \`/autonomous\` | Agent thinking loops, swarm intelligence |
| **Settings** | \`/settings\` | Theme, model, API key configuration |

## Design System — "Obsidian Command"

| Token | Value |
|-------|-------|
| Background | \`#0a0a0f\` |
| Surface | \`#0d0d15\` |
| Borders | \`#1a1a2e\` |
| Accent (gold) | \`#f0c040\` |
| Danger | \`#ef4444\` |
| Success | \`#22c55e\` |
| Text | \`#ffffff\` / \`#9ca3af\` |
| Font | JetBrains Mono, Fira Code |

## State Management

19 Zustand stores manage application state:

- \`authStore\` — GitHub OAuth, JWT, login/logout
- \`agentStore\` — Agents, personalities, chats
- \`mcpStore\` — MCP servers, builtin tools
- \`dockerStore\` — Containers, images
- \`browserStore\` — CDP browser sessions
- \`workflowStore\` — Workflow graphs
- \`workflowEditorStore\` — Canvas state (nodes, edges)
- \`settingsStore\` — Theme, model defaults
- \`secretsStore\` — API keys, provider models
- \`skillsStore\` — Skills with fallback
- \`bugBountyStore\` — Targets, findings, reports
- \`bountyHubStore\` — Platform integrations
- \`setupStore\` — Setup wizard state
- \`channelStore\` — Discord/Telegram/Slack
- \`commandCenterStore\` — Live agent feeds
- \`codeHealthStore\` — Code quality metrics
- \`themeStore\` — Dark theme tokens, scheduling
- \`modelRouterStore\` — Provider selection, fallback
- \`autonomousStore\` — Agent thoughts, swarm state, efficiency
`;

// ─── WORKFLOWS ───────────────────────────────────────────────────────────────

const workflows = `# Workflows

Harbinger uses a visual workflow graph engine built on **@xyflow/react** for orchestrating multi-agent security operations.

## Workflow Graph

Workflows are directed acyclic graphs (DAGs) with nodes representing:

- **Agent nodes** — Dispatch task to a specific agent
- **Tool nodes** — Execute a specific security tool
- **Condition nodes** — Branch based on results
- **Approval nodes** — Pause for human review
- **Handoff nodes** — Transfer context between agents

## Creating a Workflow

1. Navigate to \`/workflow-editor\`
2. Drag nodes from the palette
3. Connect nodes with edges
4. Configure each node's parameters
5. Save and execute

## Workflow Execution

When a workflow runs:

1. The orchestrator traverses the graph
2. Each node executes in dependency order
3. Parallel branches run concurrently
4. Results are passed through edges
5. All events are streamed to the UI

## Example: Full Recon Workflow

\`\`\`
[PATHFINDER: Subdomain Enum]
         │
    [Condition: >10 subs?]
    ┌────┴────┐
   Yes       No
    │         │
[PATHFINDER: [PATHFINDER:
 HTTP Probe]  DNS Brute]
    │         │
    └────┬────┘
         │
[BREACH: Nuclei Scan]
         │
    [Condition: Findings?]
    ┌────┴────┐
   Yes       No
    │         │
[SCRIBE:   [Done]
 Report]
\`\`\`
`;

// ─── CONTRIBUTING ────────────────────────────────────────────────────────────

const contributing = `# Contributing

Harbinger is open source and welcomes contributions.

## Repository Structure

\`\`\`
/
├── backend/           # Go 1.24 API server
├── harbinger-tools/
│   └── frontend/      # React + Vite + TypeScript
├── mcp-plugins/       # MCP server containers
├── agents/            # Agent profiles
├── skills/            # Skill files
├── workflows/         # Workflow templates
├── docker/            # Docker configs (nginx, postgres)
├── brand/             # ASCII banners, branding
└── docs/              # Documentation
\`\`\`

## Tech Stack

- **Frontend**: React 19 + Vite 6 + TypeScript + Zustand + Radix UI
- **Backend**: Go 1.24
- **Database**: PostgreSQL 17 (pgvector) + Redis 7.4 + Neo4j
- **Package Manager**: pnpm 9+
- **Containers**: Docker + Docker Compose

## Development Setup

\`\`\`bash
# Install dependencies
pnpm install

# Start frontend dev server
pnpm dev

# Build frontend
pnpm build:ui

# Start backend
cd backend && go run ./cmd/

# Type check
cd harbinger-tools/frontend && npx tsc --noEmit
\`\`\`

## Code Style

- Dark theme only (\`#0a0a0f\` background, \`#f0c040\` accent)
- Monospace fonts (JetBrains Mono, Fira Code)
- No AI chat bubbles, no typing animations
- Comments explain WHY, not WHAT
- All API calls must include Authorization headers
- Use \`pnpm\` (not npm or yarn)

## Pull Requests

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Ensure \`pnpm build:ui\` passes (zero errors)
5. Ensure \`go build ./cmd/\` passes
6. Submit a PR with clear description

## Security Issues

Report security vulnerabilities via GitHub private disclosure or open an issue.
`;

// ─── EXPORTED DOCS ARRAY ─────────────────────────────────────────────────────

export const docs: DocSection[] = [
  { id: "getting-started", title: "Getting Started", icon: "Rocket", content: gettingStarted },
  { id: "installation", title: "Installation", icon: "Download", content: installation },
  { id: "configuration", title: "Configuration", icon: "Settings", content: configuration },
  { id: "agents", title: "Agents", icon: "Users", content: agents },
  { id: "mcp-plugins", title: "MCP Plugins", icon: "Plug", content: mcpPlugins },
  { id: "api-reference", title: "API Reference", icon: "Code", content: apiReference },
  { id: "authentication", title: "Authentication", icon: "Key", content: authentication },
  { id: "docker", title: "Docker Services", icon: "Box", content: docker },
  { id: "security", title: "Security", icon: "Shield", content: security },
  { id: "ui-pages", title: "UI Pages", icon: "Monitor", content: uiPages },
  { id: "workflows", title: "Workflows", icon: "GitBranch", content: workflows },
  { id: "contributing", title: "Contributing", icon: "Heart", content: contributing },
];
