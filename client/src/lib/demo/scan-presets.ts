/**
 * Scan preset definitions for the demo UI.
 * These map to real backend scan types — no fake events.
 */

export interface ScanPreset {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  scanType: "recon" | "vuln_scan" | "full_audit" | "cloud_audit" | "osint";
  defaultTarget: string;
}

export const scanPresets: ScanPreset[] = [
  {
    id: "recon",
    title: "Recon Scan",
    description: "Subdomain enumeration, port scanning, and tech fingerprinting on a target domain",
    cost: 1,
    icon: "🔍",
    scanType: "recon",
    defaultTarget: "example.com",
  },
  {
    id: "vuln_scan",
    title: "Vulnerability Scan",
    description: "Automated vulnerability detection with Nuclei templates and CVE checks",
    cost: 2,
    icon: "🎯",
    scanType: "vuln_scan",
    defaultTarget: "example.com",
  },
  {
    id: "full_audit",
    title: "Full Audit",
    description: "Comprehensive security audit: recon, vuln scan, OSINT, and risk analysis",
    cost: 3,
    icon: "🛡",
    scanType: "full_audit",
    defaultTarget: "example.com",
  },
];
