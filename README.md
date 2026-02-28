# Harbinger

**Autonomous AI-Powered Security Platform**

Harbinger is an offensive security platform that orchestrates AI agents to perform real vulnerability assessments. It deploys specialized Docker containers with industry-standard security tools, coordinates multi-agent workflows, and streams results in real time via WebSocket.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React Frontend                      │
│  12 Pages · Lazy-loaded · Tailwind CSS · WebSocket   │
├──────────────────────────────────────────────────────┤
│                    Go Backend                         │
│  Chi Router · JWT Auth · Rate Limiting · Audit Log   │
├──────────────┬───────────┬───────────┬───────────────┤
│  Docker SDK  │  Stripe   │ WebSocket │   Scanner     │
│  Orchestrator│  Credits  │   Hub     │   Engine      │
├──────────────┴───────────┴───────────┴───────────────┤
│              Docker Security Containers               │
│  Recon · Scanner · Cloud · OSINT · Exploit           │
│  subfinder · nuclei · prowler · shodan · impacket    │
└──────────────────────────────────────────────────────┘
```

## Features

### Agent Swarm System
- **11 Security Agents** — PATHFINDER, BREACH, PHANTOM, SPECTER, FORGE, SAGE, SCRIBE, SENTINEL, ORACLE, MANUS, ARCHITECT
- **5 Docker Tool Images** — Real tools: subfinder, nuclei, httpx, prowler, shodan, impacket, sqlmap, and more
- **Real Container Orchestration** — Docker SDK spawns containers with resource limits (512MB/1CPU), security opts, isolated networks
- **WebSocket Streaming** — Live scan events, agent status, findings broadcast to subscribed clients

### Frontend (React 19 + TypeScript + Vite 7)
- **12 Pages** — Home, Demo, Scan, Docs, Status, Pricing, Auth, Dashboard, Settings, Scan Results, Mission Control, 404
- **Scan Dashboard** — Target input, scan type selection, live log streaming, active agents panel, findings display
- **User Dashboard** — Scan history, findings distribution, credit usage charts, quick actions
- **Settings** — Profile, API keys, webhooks, notifications, security (2FA, sessions), appearance (themes)
- **Scan Results** — Expandable finding cards, severity filters, search, evidence copying, export
- **Mission Control** — Private orchestration dashboard with pipeline runner, health scores, repo status, 45-agent grid
- **Notification System** — Real-time bell with unread badges, severity-typed alerts

### Backend (Go + Chi)
- **26 API Endpoints** — Auth, scans, credits, dashboard, notifications, API keys, webhooks, findings, reports
- **JWT Authentication** — bcrypt password hashing, API key support, middleware-based auth
- **Credit System** — In-memory credit manager + Stripe Checkout integration
- **Input Validation** — Domain validation blocking localhost, private IPs, SSRF vectors
- **Rate Limiting** — Per-IP sliding window via go-chi/httprate
- **Audit Logging** — JSONL audit trail with crypto/rand IDs

### Deployment
- **Docker Compose** — Full stack: frontend, API, PostgreSQL, Redis, 5 tool images
- **Kubernetes** — Namespace, API deployment, frontend deployment, PostgreSQL StatefulSet, Ingress
- **Build Scripts** — Automated image building for all containers

### Claude Code Integration (45 Agents)
- **7 Automation Agents** — auto-fix, auto-enhance, auto-security-scan, auto-perf, auto-test, auto-docs, git-wizard
- **6 Workflow Agents** — master-orchestrator, workflow-scheduler, codebase-analyzer, pr-reviewer, migration-planner, incident-responder
- **32 Specialist Agents** — Frontend, backend, infra, database, security, quality, docs specialists

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

### Backend

```bash
cd backend
go build ./...
go run ./cmd/server
```

### Docker Deployment

```bash
# Build all images
./deploy/build-images.sh

# Start full stack
docker compose up -d
```

## Project Structure

```
harbinger-website/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # UI components (60+ Radix UI + custom)
│       ├── pages/             # 12 page components
│       ├── lib/               # API client, WebSocket client, utilities
│       └── contexts/          # Theme context
├── backend/                   # Go backend
│   ├── cmd/server/            # Entry point
│   └── internal/
│       ├── api/               # Handlers, router, middleware, WebSocket hub
│       ├── agent/             # Agent registry and executor
│       ├── docker/            # Docker SDK orchestrator
│       ├── scan/              # Scan coordination engine
│       ├── auth/              # JWT, bcrypt, API key generation
│       ├── credits/           # Credit manager + Stripe
│       ├── validation/        # Domain/SSRF validation
│       ├── models/            # Data models
│       ├── audit/             # Audit logging
│       └── config/            # Configuration
├── docker/                    # Security tool Dockerfiles
│   ├── recon/                 # subfinder, httpx, dnsx, amass, nmap
│   ├── scanner/               # nuclei, katana, sqlmap, nikto
│   ├── cloud/                 # prowler, scoutsuite, checkov
│   ├── osint/                 # theHarvester, sherlock, shodan
│   └── exploit/               # impacket, crackmapexec, wpscan
├── deploy/                    # Deployment configs
│   ├── k8s/                   # Kubernetes manifests
│   ├── init.sql               # PostgreSQL schema
│   ├── Dockerfile.backend     # Multi-stage Go build
│   ├── Dockerfile.frontend    # Multi-stage Node build
│   └── build-images.sh        # Image build script
├── .claude/agents/            # 45 Claude Code agents
├── docker-compose.yml         # Full stack compose
└── .env.example               # Environment variables
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.6, Vite 7, Tailwind CSS 4 |
| UI | Radix UI, Lucide Icons, Framer Motion, Recharts |
| Routing | Wouter |
| Backend | Go 1.22, Chi v5, gorilla/websocket |
| Auth | JWT (golang-jwt), bcrypt |
| Payments | Stripe Checkout |
| Containers | Docker SDK, isolated networks |
| Database | PostgreSQL + pgvector (schema ready) |
| Deploy | Docker Compose, Kubernetes |
| Security Tools | subfinder, nuclei, httpx, prowler, shodan, impacket, sqlmap, nikto, amass |

## API Endpoints

### Public
- `GET /api/health` — Service health check
- `POST /api/auth/login` — User login
- `POST /api/auth/signup` — User registration
- `GET /api/agents` — List agent registry
- `GET /api/ws` — WebSocket connection

### Protected (JWT Required)
- `POST /api/scans` — Create scan
- `GET /api/scans` — List scans
- `GET /api/scans/{id}` — Get scan details
- `POST /api/scans/{id}/cancel` — Cancel scan
- `GET /api/scans/{id}/findings` — List findings
- `GET /api/scans/{id}/report` — Export report
- `GET /api/credits` — Get credit balance
- `POST /api/credits/purchase` — Purchase credits
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/notifications` — List notifications
- `POST /api/notifications/{id}/read` — Mark notification read
- `GET /api/settings/profile` — Get profile
- `PUT /api/settings/profile` — Update profile
- `GET /api/apikeys` — List API keys
- `POST /api/apikeys` — Create API key
- `DELETE /api/apikeys/{id}` — Revoke API key
- `GET /api/webhooks` — List webhooks
- `POST /api/webhooks` — Create webhook
- `DELETE /api/webhooks/{id}` — Delete webhook

## License

MIT
