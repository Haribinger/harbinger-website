package credits

import (
	"fmt"
	"sync"
)

type Manager struct {
	mu             sync.RWMutex
	balances       map[string]int // userID -> credits
	defaultCredits int
}

// NewManager creates a credit Manager where every new user is seeded with
// defaultCredits on their first interaction.
func NewManager(defaultCredits int) *Manager {
	return &Manager{
		balances:       make(map[string]int),
		defaultCredits: defaultCredits,
	}
}

// GetBalance returns the current credit balance for userID, using the default
// credit amount if the user has not yet been initialised.
func (m *Manager) GetBalance(userID string) int {
	m.mu.RLock()
	defer m.mu.RUnlock()

	balance, ok := m.balances[userID]
	if !ok {
		return m.defaultCredits
	}
	return balance
}

// InitUser seeds a user's credit balance with the default amount if it has not
// already been initialised. Subsequent calls for the same user are no-ops.
func (m *Manager) InitUser(userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.balances[userID]; !ok {
		m.balances[userID] = m.defaultCredits
	}
}

// Spend deducts amount credits from userID's balance, returning an error if
// the balance is insufficient.
func (m *Manager) Spend(userID string, amount int) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	balance, ok := m.balances[userID]
	if !ok {
		balance = m.defaultCredits
		m.balances[userID] = balance
	}

	if balance < amount {
		return fmt.Errorf("insufficient credits: have %d, need %d", balance, amount)
	}

	m.balances[userID] = balance - amount
	return nil
}

// SpendIfAffordable atomically checks whether userID can afford amount and
// deducts it in a single lock acquisition, preventing TOCTOU race conditions.
func (m *Manager) SpendIfAffordable(userID string, amount int) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	balance, ok := m.balances[userID]
	if !ok {
		balance = m.defaultCredits
		m.balances[userID] = balance
	}

	if balance < amount {
		return fmt.Errorf("insufficient credits: have %d, need %d", balance, amount)
	}

	m.balances[userID] = balance - amount
	return nil
}

// AddCredits increases userID's credit balance by amount.
func (m *Manager) AddCredits(userID string, amount int) {
	m.mu.Lock()
	defer m.mu.Unlock()

	balance, ok := m.balances[userID]
	if !ok {
		balance = m.defaultCredits
	}
	m.balances[userID] = balance + amount
}

// CanAfford reports whether userID has at least amount credits available.
func (m *Manager) CanAfford(userID string, amount int) bool {
	return m.GetBalance(userID) >= amount
}
