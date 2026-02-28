package credits

import (
	"sync"
	"testing"
)

func TestNewManager(t *testing.T) {
	m := NewManager(100)
	if m == nil {
		t.Fatal("expected non-nil manager")
	}
	if m.defaultCredits != 100 {
		t.Fatalf("expected defaultCredits=100, got %d", m.defaultCredits)
	}
}

func TestGetBalance_Default(t *testing.T) {
	m := NewManager(50)
	balance := m.GetBalance("new-user")
	if balance != 50 {
		t.Fatalf("expected 50 default credits, got %d", balance)
	}
}

func TestInitUser(t *testing.T) {
	m := NewManager(50)
	m.InitUser("u1")
	if m.balances["u1"] != 50 {
		t.Fatalf("expected 50, got %d", m.balances["u1"])
	}
	// Second call should be a no-op
	m.balances["u1"] = 30
	m.InitUser("u1")
	if m.balances["u1"] != 30 {
		t.Fatalf("expected 30 (no-op), got %d", m.balances["u1"])
	}
}

func TestSpend(t *testing.T) {
	m := NewManager(10)
	m.InitUser("u1")

	err := m.Spend("u1", 3)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if m.balances["u1"] != 7 {
		t.Fatalf("expected 7, got %d", m.balances["u1"])
	}
}

func TestSpend_Insufficient(t *testing.T) {
	m := NewManager(5)
	m.InitUser("u1")

	err := m.Spend("u1", 10)
	if err == nil {
		t.Fatal("expected error for insufficient credits")
	}
}

func TestSpend_NewUser(t *testing.T) {
	m := NewManager(20)
	err := m.Spend("new-user", 5)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if m.balances["new-user"] != 15 {
		t.Fatalf("expected 15, got %d", m.balances["new-user"])
	}
}

func TestAddCredits(t *testing.T) {
	m := NewManager(10)
	m.InitUser("u1")
	m.AddCredits("u1", 25)
	if m.balances["u1"] != 35 {
		t.Fatalf("expected 35, got %d", m.balances["u1"])
	}
}

func TestAddCredits_NewUser(t *testing.T) {
	m := NewManager(10)
	m.AddCredits("new-user", 5)
	if m.balances["new-user"] != 15 {
		t.Fatalf("expected 15, got %d", m.balances["new-user"])
	}
}

func TestCanAfford(t *testing.T) {
	m := NewManager(10)
	m.InitUser("u1")

	if !m.CanAfford("u1", 10) {
		t.Fatal("expected true for exact balance")
	}
	if !m.CanAfford("u1", 5) {
		t.Fatal("expected true for less than balance")
	}
	if m.CanAfford("u1", 11) {
		t.Fatal("expected false for more than balance")
	}
}

func TestSpendIfAffordable(t *testing.T) {
	m := NewManager(10)
	m.InitUser("u1")

	err := m.SpendIfAffordable("u1", 5)
	if err != nil {
		t.Fatalf("expected nil error, got: %v", err)
	}
	if m.balances["u1"] != 5 {
		t.Fatalf("expected 5, got %d", m.balances["u1"])
	}

	err = m.SpendIfAffordable("u1", 10)
	if err == nil {
		t.Fatal("expected error for insufficient")
	}
	if m.balances["u1"] != 5 {
		t.Fatalf("expected unchanged 5, got %d", m.balances["u1"])
	}
}

func TestConcurrentSpend(t *testing.T) {
	m := NewManager(1000)
	m.InitUser("u1")

	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_ = m.Spend("u1", 1)
		}()
	}
	wg.Wait()

	if m.balances["u1"] != 900 {
		t.Fatalf("expected 900 after 100 concurrent spends, got %d", m.balances["u1"])
	}
}
