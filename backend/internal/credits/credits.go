package credits

import (
	"fmt"
	"sync"
)

type Manager struct {
	mu       sync.RWMutex
	balances map[string]int // userID -> credits
	defaultCredits int
}

func NewManager(defaultCredits int) *Manager {
	return &Manager{
		balances:       make(map[string]int),
		defaultCredits: defaultCredits,
	}
}

func (m *Manager) GetBalance(userID string) int {
	m.mu.RLock()
	defer m.mu.RUnlock()

	balance, ok := m.balances[userID]
	if !ok {
		return m.defaultCredits
	}
	return balance
}

func (m *Manager) InitUser(userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.balances[userID]; !ok {
		m.balances[userID] = m.defaultCredits
	}
}

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

func (m *Manager) AddCredits(userID string, amount int) {
	m.mu.Lock()
	defer m.mu.Unlock()

	balance, ok := m.balances[userID]
	if !ok {
		balance = m.defaultCredits
	}
	m.balances[userID] = balance + amount
}

func (m *Manager) CanAfford(userID string, amount int) bool {
	return m.GetBalance(userID) >= amount
}
