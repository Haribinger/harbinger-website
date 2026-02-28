package agent

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	dockerOrch "github.com/harbinger-ai/harbinger/internal/docker"
	"github.com/harbinger-ai/harbinger/internal/models"
)

// Agent definitions with their Docker images and tool commands
var AgentRegistry = map[string]*models.AgentConfig{
	"pathfinder": {
		ID: "pathfinder", Name: "PATHFINDER", Role: "Recon & Discovery",
		Color: "#00d4ff", Image: "harbinger/recon:latest",
		Tools: []string{"subfinder", "httpx", "whatweb", "dirsearch", "amass"},
		Priority: 1,
	},
	"breach": {
		ID: "breach", Name: "BREACH", Role: "Exploit & Validate",
		Color: "#ef4444", Image: "harbinger/scanner:latest",
		Tools: []string{"nuclei", "sqlmap", "xsstrike", "commix"},
		Priority: 3,
	},
	"phantom": {
		ID: "phantom", Name: "PHANTOM", Role: "Cloud Security",
		Color: "#a78bfa", Image: "harbinger/cloud:latest",
		Tools: []string{"prowler", "scout-suite", "cloudsplaining"},
		Priority: 2,
	},
	"specter": {
		ID: "specter", Name: "SPECTER", Role: "OSINT & Intel",
		Color: "#f59e0b", Image: "harbinger/osint:latest",
		Tools: []string{"theHarvester", "sherlock", "spiderfoot"},
		Priority: 2,
	},
	"sage": {
		ID: "sage", Name: "SAGE", Role: "Risk Analysis",
		Color: "#4ade80", Image: "harbinger/recon:latest",
		Tools: []string{"cvss-calculator", "attack-flow", "mitre-mapper"},
		Priority: 5,
	},
	"oracle": {
		ID: "oracle", Name: "ORACLE", Role: "Threat Intelligence",
		Color: "#e879f9", Image: "harbinger/osint:latest",
		Tools: []string{"shodan-cli", "censys-cli", "greynoise"},
		Priority: 2,
	},
	"sentinel": {
		ID: "sentinel", Name: "SENTINEL", Role: "Continuous Monitor",
		Color: "#22d3ee", Image: "harbinger/scanner:latest",
		Tools: []string{"nuclei", "diff-scanner", "alert-engine"},
		Priority: 4,
	},
}

// ToolCommand maps tool names to their actual CLI commands
var ToolCommands = map[string]func(target string) []string{
	"subfinder": func(target string) []string {
		return []string{"subfinder", "-d", target, "-silent", "-all"}
	},
	"httpx": func(target string) []string {
		return []string{"httpx", "-u", target, "-silent", "-status-code", "-title", "-tech-detect", "-follow-redirects"}
	},
	"nuclei": func(target string) []string {
		return []string{"nuclei", "-u", target, "-severity", "critical,high,medium", "-silent", "-json"}
	},
	"whatweb": func(target string) []string {
		return []string{"whatweb", "--color=never", "-a", "3", target}
	},
	"amass": func(target string) []string {
		return []string{"amass", "enum", "-passive", "-d", target}
	},
	"dirsearch": func(target string) []string {
		return []string{"dirsearch", "-u", "https://" + target, "-t", "20", "--format", "json", "-q"}
	},
	"theHarvester": func(target string) []string {
		return []string{"theHarvester", "-d", target, "-b", "all", "-l", "200"}
	},
	"nmap": func(target string) []string {
		return []string{"nmap", "-sV", "-sC", "--top-ports", "1000", "-T4", target}
	},
	"nikto": func(target string) []string {
		return []string{"nikto", "-h", target, "-Format", "json", "-nointeractive"}
	},
}

type EventCallback func(event models.ScanEvent)

type Executor struct {
	orchestrator *dockerOrch.Orchestrator
}

func NewExecutor(orch *dockerOrch.Orchestrator) *Executor {
	return &Executor{orchestrator: orch}
}

// RunAgent spawns a container for the given agent and executes the specified tool
func (e *Executor) RunAgent(ctx context.Context, scanID string, agentID string, target string, tools []string, onEvent EventCallback) error {
	agent, ok := AgentRegistry[agentID]
	if !ok {
		return fmt.Errorf("unknown agent: %s", agentID)
	}

	// Notify agent thinking
	onEvent(models.ScanEvent{
		Type:    "agent_thinking",
		ScanID:  scanID,
		AgentID: agentID,
		Data:    map[string]string{"message": fmt.Sprintf("%s analyzing target %s...", agent.Name, target)},
		Timestamp: time.Now(),
	})

	for _, tool := range tools {
		cmdFn, ok := ToolCommands[tool]
		if !ok {
			log.Printf("skipping unknown tool: %s", tool)
			continue
		}

		cmd := cmdFn(target)

		// Notify tool call
		onEvent(models.ScanEvent{
			Type:    "tool_call",
			ScanID:  scanID,
			AgentID: agentID,
			Data: map[string]interface{}{
				"tool":    tool,
				"command": strings.Join(cmd, " "),
			},
			Timestamp: time.Now(),
		})

		// Spawn container
		info, err := e.orchestrator.SpawnContainer(ctx, agentID, agent.Image, cmd, []string{
			"TARGET=" + target,
			"SCAN_ID=" + scanID,
			"AGENT_ID=" + agentID,
		})
		if err != nil {
			onEvent(models.ScanEvent{
				Type:    "tool_result",
				ScanID:  scanID,
				AgentID: agentID,
				Data: map[string]interface{}{
					"tool":   tool,
					"status": "error",
					"result": fmt.Sprintf("Failed to spawn container: %v", err),
				},
				Timestamp: time.Now(),
			})
			continue
		}

		// Notify docker spawn
		onEvent(models.ScanEvent{
			Type:    "docker_spawn",
			ScanID:  scanID,
			AgentID: agentID,
			Data: map[string]interface{}{
				"container_id":   info.ID,
				"container_name": info.Name,
				"image":          info.Image,
			},
			Timestamp: time.Now(),
		})

		// Stream logs
		logCh, err := e.orchestrator.StreamLogs(ctx, info.ID)
		if err != nil {
			log.Printf("failed to stream logs for %s: %v", info.ID, err)
		} else {
			go func(containerID string) {
				for line := range logCh {
					onEvent(models.ScanEvent{
						Type:    "docker_log",
						ScanID:  scanID,
						AgentID: agentID,
						Data: map[string]interface{}{
							"container_id": containerID,
							"text":         line.Text,
							"stream":       line.Stream,
						},
						Timestamp: line.Timestamp,
					})
				}
			}(info.ID)
		}

		// Wait for completion
		exitCode, err := e.orchestrator.WaitForContainer(ctx, info.ID)

		status := "success"
		if err != nil || exitCode != 0 {
			status = "error"
		}

		// Notify tool result
		onEvent(models.ScanEvent{
			Type:    "tool_result",
			ScanID:  scanID,
			AgentID: agentID,
			Data: map[string]interface{}{
				"tool":      tool,
				"status":    status,
				"exit_code": exitCode,
			},
			Timestamp: time.Now(),
		})

		// Notify docker stop
		onEvent(models.ScanEvent{
			Type:    "docker_stop",
			ScanID:  scanID,
			AgentID: agentID,
			Data:    map[string]interface{}{"container_id": info.ID},
			Timestamp: time.Now(),
		})

		// Cleanup container
		_ = e.orchestrator.RemoveContainer(ctx, info.ID)
	}

	return nil
}

// GetAgentsForScanType returns the ordered list of agents for a scan type
func GetAgentsForScanType(scanType string) []string {
	switch scanType {
	case "recon":
		return []string{"pathfinder"}
	case "vuln_scan":
		return []string{"pathfinder", "breach"}
	case "full_audit":
		return []string{"pathfinder", "breach", "oracle", "sage"}
	case "cloud_audit":
		return []string{"phantom"}
	case "osint":
		return []string{"specter", "oracle"}
	default:
		return []string{"pathfinder"}
	}
}

// GetToolsForAgent returns the tools to run for an agent given a scan type
func GetToolsForAgent(agentID, scanType string) []string {
	switch agentID {
	case "pathfinder":
		return []string{"subfinder", "httpx"}
	case "breach":
		return []string{"nuclei"}
	case "phantom":
		return []string{"prowler"}
	case "specter":
		return []string{"theHarvester"}
	case "oracle":
		return []string{"shodan-cli"}
	case "sage":
		return []string{"cvss-calculator"}
	case "sentinel":
		return []string{"nuclei"}
	default:
		return nil
	}
}
