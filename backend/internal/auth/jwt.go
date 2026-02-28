package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidToken = errors.New("invalid or expired token")
	ErrInvalidCreds = errors.New("invalid credentials")
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Plan   string `json:"plan"`
	jwt.RegisteredClaims
}

type JWTAuth struct {
	secret []byte
	expiry time.Duration
}

// NewJWTAuth creates a JWTAuth instance that signs tokens with the provided
// HMAC-SHA256 secret and embeds the given expiry duration in each issued token.
func NewJWTAuth(secret string, expiry time.Duration) *JWTAuth {
	return &JWTAuth{
		secret: []byte(secret),
		expiry: expiry,
	}
}

// GenerateToken mints a signed JWT for the given user, embedding their ID,
// email, and plan tier. The token expires according to the configured expiry.
func (j *JWTAuth) GenerateToken(userID, email, plan string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Plan:   plan,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(j.expiry)),
			Issuer:    "harbinger",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secret)
}

// ValidateToken parses and validates a signed JWT string, returning the embedded
// claims on success or ErrInvalidToken if the token is malformed or expired.
func (j *JWTAuth) ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return j.secret, nil
	})
	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// HashPassword hashes a plaintext password with bcrypt at cost 12 for stronger
// resistance against brute-force attacks.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// CheckPassword reports whether the plaintext password matches the bcrypt hash.
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateAPIKey creates a cryptographically random API key with the "hbr_" prefix.
func GenerateAPIKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return "hbr_" + hex.EncodeToString(bytes), nil
}
