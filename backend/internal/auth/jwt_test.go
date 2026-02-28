package auth

import (
	"testing"
	"time"
)

func TestGenerateAndValidateToken(t *testing.T) {
	j := NewJWTAuth("test-secret-32-bytes-long-enough", 1*time.Hour)

	token, err := j.GenerateToken("user-1", "test@test.com", "pro")
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}

	claims, err := j.ValidateToken(token)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}

	if claims.UserID != "user-1" {
		t.Fatalf("expected UserID=user-1, got %s", claims.UserID)
	}
	if claims.Email != "test@test.com" {
		t.Fatalf("expected Email=test@test.com, got %s", claims.Email)
	}
	if claims.Plan != "pro" {
		t.Fatalf("expected Plan=pro, got %s", claims.Plan)
	}
	if claims.Issuer != "harbinger" {
		t.Fatalf("expected Issuer=harbinger, got %s", claims.Issuer)
	}
}

func TestValidateToken_Invalid(t *testing.T) {
	j := NewJWTAuth("secret", 1*time.Hour)

	_, err := j.ValidateToken("invalid.token.here")
	if err != ErrInvalidToken {
		t.Fatalf("expected ErrInvalidToken, got %v", err)
	}
}

func TestValidateToken_WrongSecret(t *testing.T) {
	j1 := NewJWTAuth("secret-1", 1*time.Hour)
	j2 := NewJWTAuth("secret-2", 1*time.Hour)

	token, err := j1.GenerateToken("u1", "e@e.com", "free")
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	_, err = j2.ValidateToken(token)
	if err != ErrInvalidToken {
		t.Fatalf("expected ErrInvalidToken for wrong secret, got %v", err)
	}
}

func TestValidateToken_Expired(t *testing.T) {
	j := NewJWTAuth("secret", -1*time.Hour) // negative expiry = already expired

	token, err := j.GenerateToken("u1", "e@e.com", "free")
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	_, err = j.ValidateToken(token)
	if err != ErrInvalidToken {
		t.Fatalf("expected ErrInvalidToken for expired token, got %v", err)
	}
}

func TestHashAndCheckPassword(t *testing.T) {
	hash, err := HashPassword("mypassword")
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if !CheckPassword("mypassword", hash) {
		t.Fatal("expected password to match")
	}
	if CheckPassword("wrongpassword", hash) {
		t.Fatal("expected wrong password to not match")
	}
}

func TestGenerateAPIKey(t *testing.T) {
	key, err := GenerateAPIKey()
	if err != nil {
		t.Fatalf("GenerateAPIKey failed: %v", err)
	}
	if len(key) < 10 {
		t.Fatalf("expected key length > 10, got %d", len(key))
	}
	if key[:4] != "hbr_" {
		t.Fatalf("expected hbr_ prefix, got %s", key[:4])
	}

	// Ensure uniqueness
	key2, _ := GenerateAPIKey()
	if key == key2 {
		t.Fatal("expected unique keys")
	}
}
