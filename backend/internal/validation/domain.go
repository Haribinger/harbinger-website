package validation

import (
	"fmt"
	"net"
	"regexp"
	"strings"
)

var domainRegex = regexp.MustCompile(`^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$`)

var blockedCIDRs = []string{
	"127.0.0.0/8",
	"10.0.0.0/8",
	"172.16.0.0/12",
	"192.168.0.0/16",
	"169.254.0.0/16",
	"::1/128",
	"fc00::/7",
	"fe80::/10",
}

var blockedDomains = []string{
	"localhost",
	"localhost.localdomain",
	"broadcasthost",
	"ip6-localhost",
	"ip6-loopback",
}

// ValidateDomain checks that the given string is a well-formed domain name or
// public IP address and rejects localhost, private, and link-local ranges.
func ValidateDomain(domain string) error {
	domain = strings.TrimSpace(strings.ToLower(domain))

	if domain == "" {
		return fmt.Errorf("domain cannot be empty")
	}

	// Block localhost variants
	for _, blocked := range blockedDomains {
		if domain == blocked {
			return fmt.Errorf("scanning %s is not allowed", domain)
		}
	}

	// Validate domain format
	if !domainRegex.MatchString(domain) {
		// Check if it's an IP address
		ip := net.ParseIP(domain)
		if ip == nil {
			return fmt.Errorf("invalid domain format: %s", domain)
		}
		return validateIP(ip)
	}

	// Resolve and check IPs
	ips, err := net.LookupIP(domain)
	if err != nil {
		// Can't resolve — allow anyway since tools will handle it
		return nil
	}

	for _, ip := range ips {
		if err := validateIP(ip); err != nil {
			return fmt.Errorf("domain %s resolves to blocked address: %v", domain, err)
		}
	}

	return nil
}

func validateIP(ip net.IP) error {
	if ip.IsLoopback() {
		return fmt.Errorf("loopback addresses are not allowed")
	}
	if ip.IsPrivate() {
		return fmt.Errorf("private addresses are not allowed")
	}
	if ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return fmt.Errorf("link-local addresses are not allowed")
	}

	for _, cidr := range blockedCIDRs {
		_, network, err := net.ParseCIDR(cidr)
		if err != nil {
			continue
		}
		if network.Contains(ip) {
			return fmt.Errorf("address %s is in blocked range %s", ip, cidr)
		}
	}

	return nil
}

// ValidateScanType returns an error if scanType is not one of the recognised
// scan type identifiers accepted by the Harbinger API.
func ValidateScanType(scanType string) error {
	valid := map[string]bool{
		"recon":       true,
		"vuln_scan":   true,
		"full_audit":  true,
		"cloud_audit": true,
		"osint":       true,
	}
	if !valid[scanType] {
		return fmt.Errorf("invalid scan type: %s", scanType)
	}
	return nil
}
