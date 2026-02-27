import type { Scenario } from "./types";

export const domainScanScenario: Scenario = {
  id: "domain-scan",
  title: "Scan a Domain",
  description: "Full recon + vuln scan on a target domain",
  cost: 2,
  icon: "🌐",
  events: [
    // Spawn PATHFINDER container
    {
      type: "docker_spawn",
      agent: "pathfinder",
      containerId: "pf-" + "a1b2c3d4e5f6",
      containerName: "harbinger-pathfinder",
      image: "harbinger/recon-scout:latest",
    },
    {
      type: "network_activity",
      connections: [{ from: "pathfinder", to: "flux", label: "task assignment" }],
      duration: 800,
    },
    { type: "agent_thinking", agent: "pathfinder", duration: 1500 },
    {
      type: "agent_message",
      agent: "pathfinder",
      text: "Starting reconnaissance on {{target}}. I'll enumerate subdomains, probe for live hosts, then hand off to BREACH for vulnerability scanning.",
    },
    {
      type: "tool_call",
      agent: "pathfinder",
      tool: "subfinder",
      command: "subfinder -d {{target}} -silent -all",
      duration: 3500,
      outputLines: [
        { text: "[INF] Enumerating subdomains for {{target}}", color: "#888" },
        { text: "[INF] Loading provider config...", color: "#555" },
        { text: "api.{{target}}", color: "#4ade80" },
        { text: "staging.{{target}}", color: "#4ade80" },
        { text: "ci.{{target}}", color: "#4ade80" },
        { text: "admin.{{target}}", color: "#4ade80" },
        { text: "blog.{{target}}", color: "#4ade80" },
        { text: "mail.{{target}}", color: "#4ade80" },
        { text: "vpn.{{target}}", color: "#4ade80" },
        { text: "dev.{{target}}", color: "#4ade80" },
        { text: "cdn.{{target}}", color: "#4ade80" },
        { text: "[INF] Found 47 subdomains for {{target}} in 3.2s", color: "#00d4ff" },
      ],
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "47 subdomains discovered (api, staging, ci, admin, blog, mail, vpn, dev, cdn, ...)",
      status: "success",
    },
    {
      type: "network_activity",
      connections: [{ from: "pathfinder", to: "{{target}}", label: "HTTP probing" }],
      duration: 1500,
    },
    {
      type: "tool_call",
      agent: "pathfinder",
      tool: "httpx",
      command: "httpx -l subs.txt -status-code -title -tech-detect -threads 50",
      duration: 4000,
      outputLines: [
        { text: "https://api.{{target}} [200] [API Gateway] [nginx]", color: "#4ade80" },
        { text: "https://staging.{{target}} [200] [Staging Environment] [Apache,PHP]", color: "#4ade80" },
        { text: "https://ci.{{target}}:8080 [200] [Jenkins Dashboard] [Jenkins,Java]", color: "#f59e0b" },
        { text: "https://admin.{{target}} [401] [Admin Panel] [React,nginx]", color: "#f59e0b" },
        { text: "https://blog.{{target}} [200] [Company Blog] [WordPress,PHP,MySQL]", color: "#4ade80" },
        { text: "https://mail.{{target}} [302] [-> /owa] [Exchange]", color: "#888" },
        { text: "https://vpn.{{target}} [200] [VPN Portal] [Fortinet]", color: "#888" },
        { text: "https://dev.{{target}} [403] [Forbidden] [nginx]", color: "#555" },
        { text: "[INF] 32 live hosts | 12 technologies detected", color: "#00d4ff" },
      ],
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "32 live hosts identified | Technologies: nginx, Apache, Node.js, WordPress, Jenkins, React, Exchange, Fortinet",
      status: "success",
    },
    {
      type: "browser_navigate",
      agent: "pathfinder",
      url: "https://ci.{{target}}:8080",
      title: "Jenkins Dashboard",
      statusCode: 200,
    },
    {
      type: "browser_action",
      agent: "pathfinder",
      action: { type: "screenshot", target: "Jenkins dashboard — checking version", timestamp: Date.now() },
    },
    {
      type: "agent_message",
      agent: "pathfinder",
      text: "Found 32 live hosts across 47 subdomains. Interesting targets: Jenkins on ci.{{target}} (version looks outdated), WordPress on blog.{{target}}, and an exposed admin panel. Handing off to BREACH for vulnerability assessment.",
    },
    { type: "handoff", from: "pathfinder", to: "breach", reason: "32 live hosts ready for vulnerability scanning" },
    // Spawn BREACH container
    {
      type: "docker_spawn",
      agent: "breach",
      containerId: "br-" + "f6e5d4c3b2a1",
      containerName: "harbinger-breach",
      image: "harbinger/exploit-engine:latest",
    },
    { type: "agent_thinking", agent: "breach", duration: 1200 },
    {
      type: "agent_message",
      agent: "breach",
      text: "Received 32 targets from PATHFINDER. Running nuclei with high/critical severity templates — focusing on the Jenkins and WordPress instances first.",
    },
    {
      type: "network_activity",
      connections: [
        { from: "breach", to: "ci.{{target}}", label: "nuclei scan" },
        { from: "breach", to: "blog.{{target}}", label: "nuclei scan" },
      ],
      duration: 2000,
    },
    {
      type: "tool_call",
      agent: "breach",
      tool: "nuclei",
      command: "nuclei -l live.txt -severity high,critical -t cves/ -t exposures/ -c 25",
      duration: 6000,
      outputLines: [
        { text: "[INF] nuclei v3.1.7 (templates: 8,247)", color: "#888" },
        { text: "[INF] Targets loaded: 32 | Templates: 1,847 | Workers: 25", color: "#888" },
        { text: "[INF] Running scan against 32 hosts...", color: "#555" },
        { text: "", color: "#555" },
        { text: "[CVE-2024-23897] [critical] ci.{{target}}:8080", color: "#ef4444" },
        { text: "  └─ Jenkins CLI Arbitrary File Read", color: "#ef4444" },
        { text: "  └─ Matched: /etc/passwd in response body", color: "#f59e0b" },
        { text: "", color: "#555" },
        { text: "[wordpress-xmlrpc-listmethods] [high] blog.{{target}}", color: "#f97316" },
        { text: "  └─ XML-RPC Brute Force + SSRF via pingback", color: "#f97316" },
        { text: "", color: "#555" },
        { text: "[INF] Scan complete: 2 findings | Duration: 5.8s", color: "#00d4ff" },
      ],
    },
    {
      type: "finding",
      agent: "breach",
      finding: {
        title: "CVE-2024-23897 — Jenkins CLI Arbitrary File Read",
        severity: "critical",
        target: "ci.{{target}}:8080",
        description: "Jenkins CLI argument handling allows unauthenticated attackers to read arbitrary files via @-argument processing. This can lead to RCE via secret extraction.",
        evidence: "Response contains /etc/passwd content via CLI argument injection",
        cvss: 9.8,
      },
    },
    {
      type: "finding",
      agent: "breach",
      finding: {
        title: "WordPress XML-RPC Brute Force + SSRF",
        severity: "high",
        target: "blog.{{target}}/xmlrpc.php",
        description: "XML-RPC interface is enabled and allows system.multicall for amplified brute force attacks. Pingback functionality can be abused for SSRF to internal services.",
        cvss: 7.5,
      },
    },
    {
      type: "agent_message",
      agent: "breach",
      text: "Scan complete. Found 2 significant vulnerabilities — the Jenkins CVE is critical and should be patched immediately. Handing off to SCRIBE for report generation.",
    },
    { type: "handoff", from: "breach", to: "scribe", reason: "2 findings ready for report generation" },
    // Spawn SCRIBE container
    {
      type: "docker_spawn",
      agent: "scribe",
      containerId: "sc-" + "112233445566",
      containerName: "harbinger-scribe",
      image: "harbinger/report-writer:latest",
    },
    { type: "agent_thinking", agent: "scribe", duration: 1000 },
    {
      type: "agent_message",
      agent: "scribe",
      text: "Generating penetration test report for {{target}}...\n\n## Executive Summary\n\nScanned 47 subdomains, identified 32 live hosts. **2 vulnerabilities** discovered:\n\n| # | Severity | Title | Target |\n|---|----------|-------|--------|\n| 1 | 🔴 CRITICAL | CVE-2024-23897 Jenkins File Read | ci.{{target}}:8080 |\n| 2 | 🟠 HIGH | WordPress XML-RPC Abuse | blog.{{target}} |\n\n**Immediate Actions:**\n1. Update Jenkins to ≥ 2.442 or LTS ≥ 2.426.3\n2. Disable XML-RPC or restrict via `.htaccess`\n3. Implement WAF rules for both endpoints\n\n*Full report exported to `harbinger-report-{{target}}.pdf`*",
    },
    {
      type: "docker_stop",
      containerId: "pf-a1b2c3d4e5f6",
    },
    {
      type: "docker_stop",
      containerId: "br-f6e5d4c3b2a1",
    },
    {
      type: "docker_stop",
      containerId: "sc-112233445566",
    },
    {
      type: "cost_summary",
      tokens: 3847,
      tools: 5,
      findings: 2,
      duration: "38s",
      containers: 3,
    },
  ],
};

export const awsAuditScenario: Scenario = {
  id: "aws-audit",
  title: "Audit AWS Security",
  description: "Cloud security posture assessment with Prowler",
  cost: 3,
  icon: "☁️",
  events: [
    // Spawn PHANTOM container
    {
      type: "docker_spawn",
      agent: "phantom",
      containerId: "ph-" + "aabbccddee01",
      containerName: "harbinger-phantom",
      image: "harbinger/cloud-auditor:latest",
    },
    {
      type: "network_activity",
      connections: [{ from: "phantom", to: "AWS API", label: "STS assume-role" }],
      duration: 1000,
    },
    { type: "agent_thinking", agent: "phantom", duration: 1800 },
    {
      type: "agent_message",
      agent: "phantom",
      text: "Initiating AWS security posture assessment. I'll run Prowler across all regions to check IAM, S3, networking, and logging configurations.",
    },
    {
      type: "tool_call",
      agent: "phantom",
      tool: "prowler",
      command: "prowler aws --severity critical high -M json-ocsf --compliance cis_2.0",
      duration: 8000,
      outputLines: [
        { text: "                          _", color: "#f59e0b" },
        { text: " _ __  _ __ _____      _| | ___ _ __", color: "#f59e0b" },
        { text: "| '_ \\| '__/ _ \\ \\ /\\ / / |/ _ \\ '__|", color: "#f59e0b" },
        { text: "| |_) | | | (_) \\ V  V /| |  __/ |", color: "#f59e0b" },
        { text: "| .__/|_|  \\___/ \\_/\\_/ |_|\\___|_|  v4.2.1", color: "#f59e0b" },
        { text: "", color: "#555" },
        { text: "[INFO] AWS Account: {{account}}", color: "#888" },
        { text: "[INFO] Regions: us-east-1, us-west-2, eu-west-1, ap-southeast-1", color: "#888" },
        { text: "[INFO] Scanning IAM...", color: "#555" },
        { text: "[CRITICAL] Root account has no MFA configured", color: "#ef4444" },
        { text: "[CRITICAL] S3 bucket '{{account}}-backups' has public ACL", color: "#ef4444" },
        { text: "[INFO] Scanning EC2...", color: "#555" },
        { text: "[HIGH] Security group sg-0a1b2c allows 0.0.0.0/0 on port 22", color: "#f97316" },
        { text: "[HIGH] Security group sg-3d4e5f allows 0.0.0.0/0 on port 3389", color: "#f97316" },
        { text: "[INFO] Scanning CloudTrail...", color: "#555" },
        { text: "[CRITICAL] CloudTrail disabled in eu-west-1", color: "#ef4444" },
        { text: "[CRITICAL] No S3 access logging on backup bucket", color: "#ef4444" },
        { text: "[INFO] Scanning VPC...", color: "#555" },
        { text: "[HIGH] VPC flow logs disabled in us-east-1", color: "#f97316" },
        { text: "", color: "#555" },
        { text: "[INFO] Scan complete: 247 resources | 18 findings | CIS 2.0: 72%", color: "#00d4ff" },
      ],
    },
    {
      type: "tool_result",
      agent: "phantom",
      result: "Scanned 247 resources across 4 regions. 18 findings: 4 critical, 6 high, 8 medium.",
      status: "warning",
    },
    {
      type: "finding",
      agent: "phantom",
      finding: {
        title: "S3 Bucket Public Access — Sensitive Data Exposure",
        severity: "critical",
        target: "s3://{{account}}-backups (us-east-1)",
        description: "S3 bucket has public read ACL enabled. Contains database backups with PII. Block Public Access is disabled at account level.",
        evidence: "GetBucketAcl returns AllUsers:READ. Objects include prod-db-dump-2024.sql.gz",
        cvss: 9.8,
      },
    },
    {
      type: "finding",
      agent: "phantom",
      finding: {
        title: "Root Account Without MFA",
        severity: "critical",
        target: "AWS Account Root User",
        description: "Root account has no MFA device configured. Root has unrestricted access to all resources and cannot be limited by IAM policies.",
        cvss: 9.1,
      },
    },
    {
      type: "agent_message",
      agent: "phantom",
      text: "Critical findings require immediate attention. The public S3 bucket with database backups is especially dangerous — that's a potential data breach. Handing off to SAGE for risk analysis and attack chain modeling.",
    },
    { type: "handoff", from: "phantom", to: "sage", reason: "4 critical findings need risk analysis" },
    // Spawn SAGE container
    {
      type: "docker_spawn",
      agent: "sage",
      containerId: "sa-" + "ffeeddccbb99",
      containerName: "harbinger-sage",
      image: "harbinger/risk-analyzer:latest",
    },
    {
      type: "network_activity",
      connections: [{ from: "sage", to: "phantom", label: "findings transfer" }],
      duration: 800,
    },
    { type: "agent_thinking", agent: "sage", duration: 2000 },
    {
      type: "agent_message",
      agent: "sage",
      text: "Analyzing attack chains for the discovered vulnerabilities...\n\n**Attack Chain: Data Exfiltration via S3**\n1. Attacker discovers public bucket via S3 enumeration\n2. Downloads database backup (prod-db-dump-2024.sql.gz)\n3. Extracts PII, credentials, API keys from dump\n4. Uses extracted credentials for lateral movement\n5. Compromises root account (no MFA protection)\n\n**CVSS Risk Score: 9.8** — This chain requires no authentication and leads to full account compromise.\n\n**MITRE ATT&CK Mapping:**\n- T1530: Data from Cloud Storage\n- T1078: Valid Accounts\n- T1098: Account Manipulation",
    },
    { type: "handoff", from: "sage", to: "scribe", reason: "Risk analysis complete, generating remediation report" },
    {
      type: "docker_spawn",
      agent: "scribe",
      containerId: "sc-" + "aabb00112233",
      containerName: "harbinger-scribe",
      image: "harbinger/report-writer:latest",
    },
    { type: "agent_thinking", agent: "scribe", duration: 1200 },
    {
      type: "agent_message",
      agent: "scribe",
      text: "## AWS Security Audit Report\n\n**Scope:** 247 resources across 4 regions | **CIS 2.0 Compliance: 72%**\n\n### Critical Findings Summary\n\n| # | Finding | Risk | Remediation |\n|---|---------|------|-------------|\n| 1 | S3 Public Bucket | Data breach | Enable Block Public Access, rotate all credentials in backup |\n| 2 | Root No MFA | Account takeover | Enable hardware MFA immediately |\n| 3 | CloudTrail Disabled (eu-west-1) | No audit trail | Enable multi-region trail |\n| 4 | Security Groups 0.0.0.0/0 | Unrestricted access | Restrict to known CIDR ranges |\n\n### Remediation Timeline\n- **Immediate (0-24h):** Items 1, 2\n- **This week:** Items 3, 4\n- **30 days:** Full CIS 2.0 remediation for remaining 14 findings\n\n*Report exported to `harbinger-aws-audit.pdf`*",
    },
    { type: "docker_stop", containerId: "ph-aabbccddee01" },
    { type: "docker_stop", containerId: "sa-ffeeddccbb99" },
    { type: "docker_stop", containerId: "sc-aabb00112233" },
    {
      type: "cost_summary",
      tokens: 5291,
      tools: 4,
      findings: 4,
      duration: "52s",
      containers: 3,
    },
  ],
};

export const webAppScenario: Scenario = {
  id: "web-app",
  title: "Test Web App",
  description: "Full web application penetration test",
  cost: 2,
  icon: "🕸",
  events: [
    // Spawn PATHFINDER container
    {
      type: "docker_spawn",
      agent: "pathfinder",
      containerId: "pf-" + "99887766aabb",
      containerName: "harbinger-pathfinder",
      image: "harbinger/recon-scout:latest",
    },
    { type: "agent_thinking", agent: "pathfinder", duration: 1400 },
    {
      type: "agent_message",
      agent: "pathfinder",
      text: "Starting web application assessment on {{target}}. Running technology fingerprinting and directory enumeration first.",
    },
    {
      type: "browser_navigate",
      agent: "pathfinder",
      url: "https://{{target}}",
      title: "{{target}} — Web Application",
      statusCode: 200,
    },
    {
      type: "browser_action",
      agent: "pathfinder",
      action: { type: "screenshot", target: "Homepage — tech fingerprinting", timestamp: Date.now() },
    },
    {
      type: "tool_call",
      agent: "pathfinder",
      tool: "whatweb",
      command: "whatweb {{target}} --aggression 3 --color=never",
      duration: 2500,
      outputLines: [
        { text: "WhatWeb report for {{target}}", color: "#888" },
        { text: "Status: 200 OK", color: "#4ade80" },
        { text: "Server: nginx/1.24.0", color: "#888" },
        { text: "X-Powered-By: Express", color: "#888" },
        { text: "Framework: React 18.2.0", color: "#00d4ff" },
        { text: "Backend: Node.js 20.x", color: "#00d4ff" },
        { text: "Endpoint: /graphql (GraphQL)", color: "#f59e0b" },
        { text: "Endpoint: /api-docs (Swagger UI)", color: "#f59e0b" },
      ],
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "Stack: React 18 + Node.js 20 + Express | GraphQL endpoint detected | Swagger UI at /api-docs",
      status: "success",
    },
    {
      type: "network_activity",
      connections: [{ from: "pathfinder", to: "{{target}}", label: "dir enumeration" }],
      duration: 1200,
    },
    {
      type: "tool_call",
      agent: "pathfinder",
      tool: "dirsearch",
      command: "dirsearch -u {{target}} -e js,json,graphql -t 50 --exclude-status 404",
      duration: 3500,
      outputLines: [
        { text: "[09:15:01] Starting: ", color: "#888" },
        { text: "[09:15:02] 200 - 1.2KB  - /graphql", color: "#4ade80" },
        { text: "[09:15:02] 200 - 45KB   - /api-docs", color: "#4ade80" },
        { text: "[09:15:03] 401 - 28B    - /api/v1/users", color: "#f59e0b" },
        { text: "[09:15:03] 200 - 892B   - /.env", color: "#ef4444" },
        { text: "[09:15:04] 200 - 2.1KB  - /debug/vars", color: "#ef4444" },
        { text: "[09:15:04] 200 - 1.8KB  - /.git/config", color: "#ef4444" },
        { text: "[09:15:05] 403 - 162B   - /admin", color: "#888" },
        { text: "", color: "#555" },
        { text: "Task completed | 7 results | 3 critical", color: "#00d4ff" },
      ],
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "Found: /graphql (200), /api-docs (200), /api/v1/users (401), /.env (200!), /debug/vars (200)",
      status: "warning",
    },
    {
      type: "browser_navigate",
      agent: "pathfinder",
      url: "https://{{target}}/.env",
      title: "Environment File — EXPOSED",
      statusCode: 200,
    },
    {
      type: "browser_action",
      agent: "pathfinder",
      action: { type: "screenshot", target: "Exposed .env file contents", timestamp: Date.now() },
    },
    {
      type: "agent_message",
      agent: "pathfinder",
      text: "Exposed .env file and debug endpoint detected — these are high-priority targets. GraphQL introspection and Swagger are also exposed. Handing off to BREACH for exploitation.",
    },
    { type: "handoff", from: "pathfinder", to: "breach", reason: "Exposed endpoints & .env file detected" },
    // Spawn BREACH container
    {
      type: "docker_spawn",
      agent: "breach",
      containerId: "br-" + "ccddee001122",
      containerName: "harbinger-breach",
      image: "harbinger/exploit-engine:latest",
    },
    { type: "agent_thinking", agent: "breach", duration: 1300 },
    {
      type: "network_activity",
      connections: [
        { from: "breach", to: "{{target}}", label: "vuln scan" },
        { from: "breach", to: "{{target}}/graphql", label: "introspection" },
      ],
      duration: 1500,
    },
    {
      type: "tool_call",
      agent: "breach",
      tool: "nuclei",
      command: "nuclei -u {{target}} -t exposures/ -t graphql/ -t apis/ -severity medium,high,critical",
      duration: 4500,
      outputLines: [
        { text: "[INF] nuclei v3.1.7", color: "#888" },
        { text: "[INF] Templates loaded: 342", color: "#888" },
        { text: "", color: "#555" },
        { text: "[env-file] [critical] {{target}}/.env", color: "#ef4444" },
        { text: "  └─ DB_HOST=prod-rds.internal", color: "#ef4444" },
        { text: "  └─ JWT_SECRET=harbinger-super-secret-key-2024", color: "#ef4444" },
        { text: "  └─ STRIPE_SK=sk_live_...", color: "#ef4444" },
        { text: "", color: "#555" },
        { text: "[graphql-introspection] [high] {{target}}/graphql", color: "#f97316" },
        { text: "  └─ Full schema exposed: 47 types, 23 mutations", color: "#f97316" },
        { text: "", color: "#555" },
        { text: "[swagger-api] [medium] {{target}}/api-docs", color: "#f59e0b" },
        { text: "  └─ 31 endpoints documented, auth bypass possible", color: "#f59e0b" },
      ],
    },
    {
      type: "finding",
      agent: "breach",
      finding: {
        title: "Exposed .env File — Credentials Leak",
        severity: "critical",
        target: "{{target}}/.env",
        description: "Environment file publicly accessible. Contains database credentials, API keys, and JWT secret. Immediate credential rotation required.",
        evidence: "DB_HOST=prod-rds.internal, JWT_SECRET=harbinger-super-secret-key-2024, STRIPE_SK=sk_live_...",
        cvss: 9.8,
      },
    },
    {
      type: "finding",
      agent: "breach",
      finding: {
        title: "GraphQL Introspection Enabled",
        severity: "high",
        target: "{{target}}/graphql",
        description: "Full schema introspection is enabled in production, exposing all types, queries, mutations, and internal fields to attackers.",
        cvss: 7.2,
      },
    },
    {
      type: "finding",
      agent: "breach",
      finding: {
        title: "Swagger/OpenAPI Exposed in Production",
        severity: "medium",
        target: "{{target}}/api-docs",
        description: "API documentation is publicly accessible, revealing all endpoints, parameters, and authentication mechanisms.",
        cvss: 5.3,
      },
    },
    {
      type: "agent_message",
      agent: "breach",
      text: "The .env exposure is severe — attackers can access the database directly with those credentials. Handing off to SPECTER for OSINT to check if these credentials have leaked elsewhere.",
    },
    { type: "handoff", from: "breach", to: "specter", reason: "Checking for credential exposure in public sources" },
    // Spawn SPECTER container
    {
      type: "docker_spawn",
      agent: "specter",
      containerId: "sp-" + "aabb11223344",
      containerName: "harbinger-specter",
      image: "harbinger/osint-collector:latest",
    },
    { type: "agent_thinking", agent: "specter", duration: 1500 },
    {
      type: "network_activity",
      connections: [
        { from: "specter", to: "GitHub", label: "code search" },
        { from: "specter", to: "Shodan", label: "host lookup" },
      ],
      duration: 1200,
    },
    {
      type: "tool_call",
      agent: "specter",
      tool: "theHarvester",
      command: "theHarvester -d {{target}} -b all -l 200",
      duration: 3500,
      outputLines: [
        { text: "*******************************************************************", color: "#f59e0b" },
        { text: "* theHarvester v4.4.3                                              *", color: "#f59e0b" },
        { text: "*******************************************************************", color: "#f59e0b" },
        { text: "", color: "#555" },
        { text: "[*] Target: {{target}}", color: "#888" },
        { text: "[*] Searching Google...", color: "#555" },
        { text: "[*] Searching GitHub...", color: "#555" },
        { text: "[*] Searching Shodan...", color: "#555" },
        { text: "", color: "#555" },
        { text: "[+] Emails found: 12", color: "#4ade80" },
        { text: "[+] API keys on GitHub: 3 (2 active)", color: "#ef4444" },
        { text: "[+] Leaked credentials: 1 pair on paste site", color: "#ef4444" },
        { text: "[+] Subdomains (new): 3", color: "#4ade80" },
      ],
    },
    {
      type: "tool_result",
      agent: "specter",
      result: "Found 12 email addresses, 3 API keys on GitHub (2 active), 1 leaked credential pair on paste site",
      status: "warning",
    },
    {
      type: "finding",
      agent: "specter",
      finding: {
        title: "Active API Keys Exposed on GitHub",
        severity: "high",
        target: "github.com/{{org}}/backend (commit a3f7c2d)",
        description: "2 active API keys found in public GitHub repository commit history. Keys grant access to production Stripe and SendGrid services.",
        cvss: 8.1,
      },
    },
    { type: "handoff", from: "specter", to: "scribe", reason: "4 findings ready for comprehensive report" },
    {
      type: "docker_spawn",
      agent: "scribe",
      containerId: "sc-" + "eeff00112233",
      containerName: "harbinger-scribe",
      image: "harbinger/report-writer:latest",
    },
    { type: "agent_thinking", agent: "scribe", duration: 1000 },
    {
      type: "agent_message",
      agent: "scribe",
      text: "## Web Application Pentest Report — {{target}}\n\n### Executive Summary\n4 vulnerabilities found across application, configuration, and OSINT vectors.\n\n| # | Severity | Finding | Target |\n|---|----------|---------|--------|\n| 1 | 🔴 CRITICAL | .env File Exposed | {{target}}/.env |\n| 2 | 🟠 HIGH | GraphQL Introspection | {{target}}/graphql |\n| 3 | 🟡 MEDIUM | Swagger API Docs Exposed | {{target}}/api-docs |\n| 4 | 🟠 HIGH | API Keys on GitHub | Public repository |\n\n**Immediate Actions:**\n1. Remove/restrict .env file access — rotate ALL exposed credentials\n2. Disable GraphQL introspection in production\n3. Restrict /api-docs to authenticated users\n4. Revoke and rotate all GitHub-exposed API keys\n5. Enable secret scanning on all repositories\n\n*Full report exported to `harbinger-webapp-{{target}}.pdf`*",
    },
    { type: "docker_stop", containerId: "pf-99887766aabb" },
    { type: "docker_stop", containerId: "br-ccddee001122" },
    { type: "docker_stop", containerId: "sp-aabb11223344" },
    { type: "docker_stop", containerId: "sc-eeff00112233" },
    {
      type: "cost_summary",
      tokens: 4523,
      tools: 6,
      findings: 4,
      duration: "44s",
      containers: 4,
    },
  ],
};

export const scenarios: Scenario[] = [domainScanScenario, awsAuditScenario, webAppScenario];

/**
 * Replace {{target}}, {{account}}, {{org}} placeholders in scenario events.
 */
export function hydrateScenario(scenario: Scenario, target: string): Scenario {
  const org = target.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-");
  const account = org + "-prod";
  const json = JSON.stringify(scenario.events);
  const hydrated = json
    .replace(/\{\{target\}\}/g, target)
    .replace(/\{\{account\}\}/g, account)
    .replace(/\{\{org\}\}/g, org);
  return { ...scenario, events: JSON.parse(hydrated) };
}

/**
 * Match free-text input to the best scenario + extract domain if present.
 */
export function matchScenario(input: string): { scenario: Scenario; target: string } {
  const lower = input.toLowerCase();
  const domainMatch = input.match(/([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}/);
  const target = domainMatch ? domainMatch[0] : "example.com";

  if (/\b(aws|cloud|s3|iam|bucket|ec2|lambda|prowler)\b/.test(lower)) {
    return { scenario: awsAuditScenario, target };
  }
  if (/\b(web\s*app|api|xss|sql|graphql|swagger|endpoint|owasp|inject)\b/.test(lower)) {
    return { scenario: webAppScenario, target };
  }
  return { scenario: domainScanScenario, target };
}
