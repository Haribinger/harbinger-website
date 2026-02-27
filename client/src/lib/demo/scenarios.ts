import type { Scenario } from "./types";

export const domainScanScenario: Scenario = {
  id: "domain-scan",
  title: "Scan a Domain",
  description: "Full recon + vuln scan on a target domain",
  cost: 2,
  icon: "🌐",
  events: [
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
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "47 subdomains discovered (api.{{target}}, staging.{{target}}, ci.{{target}}, admin.{{target}}, ...)",
      status: "success",
    },
    {
      type: "tool_call",
      agent: "pathfinder",
      tool: "httpx",
      command: "httpx -l subs.txt -status-code -title -tech-detect -threads 50",
      duration: 4000,
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "32 live hosts identified | Technologies: nginx, Apache, Node.js, WordPress, Jenkins, React",
      status: "success",
    },
    {
      type: "agent_message",
      agent: "pathfinder",
      text: "Found 32 live hosts across 47 subdomains. Interesting targets: Jenkins on ci.{{target}}, WordPress on blog.{{target}}, and an exposed admin panel. Handing off to BREACH for vulnerability assessment.",
    },
    { type: "handoff", from: "pathfinder", to: "breach", reason: "32 live hosts ready for vulnerability scanning" },
    { type: "agent_thinking", agent: "breach", duration: 1200 },
    {
      type: "agent_message",
      agent: "breach",
      text: "Received 32 targets from PATHFINDER. Running nuclei with high/critical severity templates — focusing on the Jenkins and WordPress instances first.",
    },
    {
      type: "tool_call",
      agent: "breach",
      tool: "nuclei",
      command: "nuclei -l live.txt -severity high,critical -t cves/ -t exposures/ -c 25",
      duration: 6000,
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
      },
    },
    {
      type: "agent_message",
      agent: "breach",
      text: "Scan complete. Found 2 significant vulnerabilities — the Jenkins CVE is critical and should be patched immediately. Handing off to SCRIBE for report generation.",
    },
    { type: "handoff", from: "breach", to: "scribe", reason: "2 findings ready for report generation" },
    { type: "agent_thinking", agent: "scribe", duration: 1000 },
    {
      type: "agent_message",
      agent: "scribe",
      text: "Generating penetration test report for {{target}}...\n\n## Executive Summary\n\nScanned 47 subdomains, identified 32 live hosts. **2 vulnerabilities** discovered:\n\n| # | Severity | Title | Target |\n|---|----------|-------|--------|\n| 1 | 🔴 CRITICAL | CVE-2024-23897 Jenkins File Read | ci.{{target}}:8080 |\n| 2 | 🟠 HIGH | WordPress XML-RPC Abuse | blog.{{target}} |\n\n**Immediate Actions:**\n1. Update Jenkins to ≥ 2.442 or LTS ≥ 2.426.3\n2. Disable XML-RPC or restrict via `.htaccess`\n3. Implement WAF rules for both endpoints\n\n*Full report exported to `harbinger-report-{{target}}.pdf`*",
    },
    {
      type: "cost_summary",
      tokens: 3847,
      tools: 5,
      findings: 2,
      duration: "38s",
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
      },
    },
    {
      type: "agent_message",
      agent: "phantom",
      text: "Critical findings require immediate attention. The public S3 bucket with database backups is especially dangerous — that's a potential data breach. Handing off to SAGE for risk analysis and attack chain modeling.",
    },
    { type: "handoff", from: "phantom", to: "sage", reason: "4 critical findings need risk analysis" },
    { type: "agent_thinking", agent: "sage", duration: 2000 },
    {
      type: "agent_message",
      agent: "sage",
      text: "Analyzing attack chains for the discovered vulnerabilities...\n\n**Attack Chain: Data Exfiltration via S3**\n1. Attacker discovers public bucket via S3 enumeration\n2. Downloads database backup (prod-db-dump-2024.sql.gz)\n3. Extracts PII, credentials, API keys from dump\n4. Uses extracted credentials for lateral movement\n5. Compromises root account (no MFA protection)\n\n**CVSS Risk Score: 9.8** — This chain requires no authentication and leads to full account compromise.\n\n**MITRE ATT&CK Mapping:**\n- T1530: Data from Cloud Storage\n- T1078: Valid Accounts\n- T1098: Account Manipulation",
    },
    { type: "handoff", from: "sage", to: "scribe", reason: "Risk analysis complete, generating remediation report" },
    { type: "agent_thinking", agent: "scribe", duration: 1200 },
    {
      type: "agent_message",
      agent: "scribe",
      text: "## AWS Security Audit Report\n\n**Scope:** 247 resources across 4 regions | **CIS 2.0 Compliance: 72%**\n\n### Critical Findings Summary\n\n| # | Finding | Risk | Remediation |\n|---|---------|------|-------------|\n| 1 | S3 Public Bucket | Data breach | Enable Block Public Access, rotate all credentials in backup |\n| 2 | Root No MFA | Account takeover | Enable hardware MFA immediately |\n| 3 | CloudTrail Disabled (eu-west-1) | No audit trail | Enable multi-region trail |\n| 4 | Security Groups 0.0.0.0/0 | Unrestricted access | Restrict to known CIDR ranges |\n\n### Remediation Timeline\n- **Immediate (0-24h):** Items 1, 2\n- **This week:** Items 3, 4\n- **30 days:** Full CIS 2.0 remediation for remaining 14 findings\n\n*Report exported to `harbinger-aws-audit.pdf`*",
    },
    {
      type: "cost_summary",
      tokens: 5291,
      tools: 4,
      findings: 4,
      duration: "52s",
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
    { type: "agent_thinking", agent: "pathfinder", duration: 1400 },
    {
      type: "agent_message",
      agent: "pathfinder",
      text: "Starting web application assessment on {{target}}. Running technology fingerprinting and directory enumeration first.",
    },
    {
      type: "tool_call",
      agent: "pathfinder",
      tool: "whatweb",
      command: "whatweb {{target}} --aggression 3 --color=never",
      duration: 2500,
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "Stack: React 18 + Node.js 20 + Express | GraphQL endpoint detected | Swagger UI at /api-docs",
      status: "success",
    },
    {
      type: "tool_call",
      agent: "pathfinder",
      tool: "dirsearch",
      command: "dirsearch -u {{target}} -e js,json,graphql -t 50 --exclude-status 404",
      duration: 3500,
    },
    {
      type: "tool_result",
      agent: "pathfinder",
      result: "Found: /graphql (200), /api-docs (200), /api/v1/users (401), /.env (200!), /debug/vars (200)",
      status: "warning",
    },
    {
      type: "agent_message",
      agent: "pathfinder",
      text: "Exposed .env file and debug endpoint detected — these are high-priority targets. GraphQL introspection and Swagger are also exposed. Handing off to BREACH for exploitation.",
    },
    { type: "handoff", from: "pathfinder", to: "breach", reason: "Exposed endpoints & .env file detected" },
    { type: "agent_thinking", agent: "breach", duration: 1300 },
    {
      type: "tool_call",
      agent: "breach",
      tool: "nuclei",
      command: "nuclei -u {{target}} -t exposures/ -t graphql/ -t apis/ -severity medium,high,critical",
      duration: 4500,
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
      },
    },
    {
      type: "agent_message",
      agent: "breach",
      text: "The .env exposure is severe — attackers can access the database directly with those credentials. Handing off to SPECTER for OSINT to check if these credentials have leaked elsewhere.",
    },
    { type: "handoff", from: "breach", to: "specter", reason: "Checking for credential exposure in public sources" },
    { type: "agent_thinking", agent: "specter", duration: 1500 },
    {
      type: "tool_call",
      agent: "specter",
      tool: "theHarvester",
      command: "theHarvester -d {{target}} -b all -l 200",
      duration: 3500,
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
      },
    },
    { type: "handoff", from: "specter", to: "scribe", reason: "4 findings ready for comprehensive report" },
    { type: "agent_thinking", agent: "scribe", duration: 1000 },
    {
      type: "agent_message",
      agent: "scribe",
      text: "## Web Application Pentest Report — {{target}}\n\n### Executive Summary\n4 vulnerabilities found across application, configuration, and OSINT vectors.\n\n| # | Severity | Finding | Target |\n|---|----------|---------|--------|\n| 1 | 🔴 CRITICAL | .env File Exposed | {{target}}/.env |\n| 2 | 🟠 HIGH | GraphQL Introspection | {{target}}/graphql |\n| 3 | 🟡 MEDIUM | Swagger API Docs Exposed | {{target}}/api-docs |\n| 4 | 🟠 HIGH | API Keys on GitHub | Public repository |\n\n**Immediate Actions:**\n1. Remove/restrict .env file access — rotate ALL exposed credentials\n2. Disable GraphQL introspection in production\n3. Restrict /api-docs to authenticated users\n4. Revoke and rotate all GitHub-exposed API keys\n5. Enable secret scanning on all repositories\n\n*Full report exported to `harbinger-webapp-{{target}}.pdf`*",
    },
    {
      type: "cost_summary",
      tokens: 4523,
      tools: 6,
      findings: 4,
      duration: "44s",
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
