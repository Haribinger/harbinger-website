package validation

import (
	"testing"
)

func TestValidateDomain_ValidDomains(t *testing.T) {
	valid := []string{
		"example.com",
		"sub.example.com",
		"my-site.co.uk",
		"test123.org",
	}
	for _, domain := range valid {
		if err := ValidateDomain(domain); err != nil {
			t.Errorf("expected %q to be valid, got error: %v", domain, err)
		}
	}
}

func TestValidateDomain_Empty(t *testing.T) {
	if err := ValidateDomain(""); err == nil {
		t.Fatal("expected error for empty domain")
	}
	if err := ValidateDomain("  "); err == nil {
		t.Fatal("expected error for whitespace domain")
	}
}

func TestValidateDomain_Localhost(t *testing.T) {
	blocked := []string{
		"localhost",
		"LOCALHOST",
		"localhost.localdomain",
		"ip6-localhost",
	}
	for _, domain := range blocked {
		if err := ValidateDomain(domain); err == nil {
			t.Errorf("expected %q to be blocked", domain)
		}
	}
}

func TestValidateDomain_PrivateIPs(t *testing.T) {
	blocked := []string{
		"127.0.0.1",
		"10.0.0.1",
		"172.16.0.1",
		"192.168.1.1",
		"169.254.0.1",
	}
	for _, ip := range blocked {
		if err := ValidateDomain(ip); err == nil {
			t.Errorf("expected %q to be blocked", ip)
		}
	}
}

func TestValidateDomain_PublicIP(t *testing.T) {
	// 8.8.8.8 is Google DNS, should be allowed
	if err := ValidateDomain("8.8.8.8"); err != nil {
		t.Fatalf("expected public IP to be valid, got: %v", err)
	}
}

func TestValidateDomain_InvalidFormat(t *testing.T) {
	invalid := []string{
		"not a domain",
		"!!invalid!!",
		"-starts-with-dash.com",
	}
	for _, domain := range invalid {
		if err := ValidateDomain(domain); err == nil {
			t.Errorf("expected %q to be invalid", domain)
		}
	}
}

func TestValidateScanType(t *testing.T) {
	valid := []string{"recon", "vuln_scan", "full_audit", "cloud_audit", "osint"}
	for _, st := range valid {
		if err := ValidateScanType(st); err != nil {
			t.Errorf("expected %q to be valid, got: %v", st, err)
		}
	}

	invalid := []string{"invalid", "port_scan", "", "RECON"}
	for _, st := range invalid {
		if err := ValidateScanType(st); err == nil {
			t.Errorf("expected %q to be invalid", st)
		}
	}
}
