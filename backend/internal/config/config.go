package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port            string
	DatabaseURL     string
	JWTSecret       string
	JWTExpiry       time.Duration
	StripeKey       string
	StripeWebhook   string
	DockerHost      string
	DockerNetwork   string
	MaxContainers   int
	RateLimitRPM    int
	AuditLogPath    string
	AllowedOrigins  []string
	DefaultCredits  int
	WebhookURL      string
}

func Load() *Config {
	return &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://harbinger:harbinger@localhost:5432/harbinger?sslmode=disable"),
		JWTSecret:      getEnv("JWT_SECRET", "change-me-in-production-32-bytes!"),
		JWTExpiry:      parseDuration(getEnv("JWT_EXPIRY", "24h")),
		StripeKey:      getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhook:  getEnv("STRIPE_WEBHOOK_SECRET", ""),
		DockerHost:     getEnv("DOCKER_HOST", "unix:///var/run/docker.sock"),
		DockerNetwork:  getEnv("DOCKER_NETWORK", "harbinger-net"),
		MaxContainers:  getEnvInt("MAX_CONTAINERS", 20),
		RateLimitRPM:   getEnvInt("RATE_LIMIT_RPM", 10),
		AuditLogPath:   getEnv("AUDIT_LOG_PATH", "./logs/audit.jsonl"),
		AllowedOrigins: []string{getEnv("CORS_ORIGIN", "http://localhost:3000")},
		DefaultCredits: getEnvInt("DEFAULT_CREDITS", 50),
		WebhookURL:     getEnv("WEBHOOK_URL", ""),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 24 * time.Hour
	}
	return d
}
