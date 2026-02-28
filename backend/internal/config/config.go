package config

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"
)

// minJWTSecretLen is the minimum acceptable length (bytes) for the JWT signing
// secret. HMAC-SHA256 requires at least 32 bytes for cryptographic strength.
const minJWTSecretLen = 32

// defaultJWTSecret is used in development only; it is intentionally distinct
// from any real secret so it is easy to detect if left in production.
const defaultJWTSecret = "change-me-in-production-32-bytes!"

// Config holds all runtime configuration loaded from environment variables.
type Config struct {
	Port           string
	DatabaseURL    string
	JWTSecret      string
	JWTExpiry      time.Duration
	StripeKey      string
	StripeWebhook  string
	DockerHost     string
	DockerNetwork  string
	MaxContainers  int
	RateLimitRPM   int
	AuditLogPath   string
	AllowedOrigins []string
	DefaultCredits int
	WebhookURL     string
}

// Load reads configuration from environment variables and validates critical
// security settings, warning loudly when insecure defaults are detected.
func Load() *Config {
	jwtSecret := getEnv("JWT_SECRET", defaultJWTSecret)
	if jwtSecret == defaultJWTSecret {
		log.Println("WARNING: JWT_SECRET is set to the insecure default — set a strong secret before deploying to production")
	} else if len(jwtSecret) < minJWTSecretLen {
		log.Printf("WARNING: JWT_SECRET is only %d bytes; a minimum of %d bytes is required for HMAC-SHA256 security", len(jwtSecret), minJWTSecretLen)
	}

	corsOrigins := getEnv("CORS_ORIGIN", "http://localhost:3000")
	origins := splitOrigins(corsOrigins)

	return &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://harbinger:harbinger@localhost:5432/harbinger?sslmode=disable"),
		JWTSecret:      jwtSecret,
		JWTExpiry:      parseDuration(getEnv("JWT_EXPIRY", "24h")),
		StripeKey:      getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhook:  getEnv("STRIPE_WEBHOOK_SECRET", ""),
		DockerHost:     getEnv("DOCKER_HOST", "unix:///var/run/docker.sock"),
		DockerNetwork:  getEnv("DOCKER_NETWORK", "harbinger-net"),
		MaxContainers:  getEnvInt("MAX_CONTAINERS", 20),
		RateLimitRPM:   getEnvInt("RATE_LIMIT_RPM", 10),
		AuditLogPath:   getEnv("AUDIT_LOG_PATH", "./logs/audit.jsonl"),
		AllowedOrigins: origins,
		DefaultCredits: getEnvInt("DEFAULT_CREDITS", 50),
		WebhookURL:     getEnv("WEBHOOK_URL", ""),
	}
}

// splitOrigins splits a comma-separated list of allowed CORS origins and trims
// whitespace from each entry.
func splitOrigins(s string) []string {
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			result = append(result, t)
		}
	}
	return result
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
