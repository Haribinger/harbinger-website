-- Harbinger Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE,
    credits INTEGER NOT NULL DEFAULT 50,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key);

-- Scans
CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    target VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    credits_cost INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);

-- Findings
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id VARCHAR(50) NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    target VARCHAR(255) NOT NULL,
    description TEXT,
    evidence TEXT,
    cvss DECIMAL(3,1),
    cve VARCHAR(50),
    remediation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_findings_scan_id ON findings(scan_id);
CREATE INDEX idx_findings_severity ON findings(severity);

-- Containers
CREATE TABLE IF NOT EXISTS containers (
    id VARCHAR(50) PRIMARY KEY,
    scan_id VARCHAR(50) NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) NOT NULL,
    docker_id VARCHAR(100),
    image VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'creating',
    cpu_percent DECIMAL(5,2) DEFAULT 0,
    memory_mb DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stopped_at TIMESTAMPTZ
);

CREATE INDEX idx_containers_scan_id ON containers(scan_id);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    details JSONB,
    ip VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'purchase', 'spend', 'refund', 'bonus'
    description TEXT,
    stripe_session_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_user_id ON credit_transactions(user_id);

-- Scheduled scans
CREATE TABLE IF NOT EXISTS scheduled_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    target VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scheduled_scans_next_run ON scheduled_scans(next_run_at) WHERE enabled = true;

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{"scan_complete"}',
    secret VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
