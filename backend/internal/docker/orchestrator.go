package docker

import (
	"context"
	"fmt"
	"io"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
)

type ContainerInfo struct {
	ID       string
	Name     string
	Image    string
	AgentID  string
	Status   string
	StartedAt time.Time
}

type LogLine struct {
	ContainerID string    `json:"container_id"`
	Text        string    `json:"text"`
	Stream      string    `json:"stream"` // stdout or stderr
	Timestamp   time.Time `json:"timestamp"`
}

type Orchestrator struct {
	client      *client.Client
	networkName string
	maxContainers int
	mu          sync.RWMutex
	containers  map[string]*ContainerInfo
	logChannels map[string]chan LogLine
}

func NewOrchestrator(networkName string, maxContainers int) (*Orchestrator, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("docker client: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = cli.Ping(ctx)
	if err != nil {
		return nil, fmt.Errorf("docker not available: %w", err)
	}

	orch := &Orchestrator{
		client:        cli,
		networkName:   networkName,
		maxContainers: maxContainers,
		containers:    make(map[string]*ContainerInfo),
		logChannels:   make(map[string]chan LogLine),
	}

	if err := orch.ensureNetwork(context.Background()); err != nil {
		log.Printf("warning: could not create docker network: %v", err)
	}

	return orch, nil
}

func (o *Orchestrator) ensureNetwork(ctx context.Context) error {
	networks, err := o.client.NetworkList(ctx, network.ListOptions{})
	if err != nil {
		return err
	}

	for _, n := range networks {
		if n.Name == o.networkName {
			return nil
		}
	}

	_, err = o.client.NetworkCreate(ctx, o.networkName, network.CreateOptions{
		Driver: "bridge",
	})
	return err
}

func (o *Orchestrator) SpawnContainer(ctx context.Context, agentID, imageName string, cmd []string, envVars []string) (*ContainerInfo, error) {
	o.mu.Lock()
	if len(o.containers) >= o.maxContainers {
		o.mu.Unlock()
		return nil, fmt.Errorf("maximum container limit (%d) reached", o.maxContainers)
	}
	o.mu.Unlock()

	containerName := fmt.Sprintf("harbinger-%s-%d", agentID, time.Now().UnixMilli())

	// Pull image if not present
	if err := o.pullImage(ctx, imageName); err != nil {
		log.Printf("warning: image pull failed for %s: %v (trying with local)", imageName, err)
	}

	resp, err := o.client.ContainerCreate(ctx,
		&container.Config{
			Image: imageName,
			Cmd:   cmd,
			Env:   envVars,
			Labels: map[string]string{
				"harbinger.agent": agentID,
				"harbinger.managed": "true",
			},
			Tty: false,
		},
		&container.HostConfig{
			NetworkMode: container.NetworkMode(o.networkName),
			Resources: container.Resources{
				Memory:   512 * 1024 * 1024, // 512MB
				NanoCPUs: 1_000_000_000,     // 1 CPU
			},
			AutoRemove: false,
			SecurityOpt: []string{"no-new-privileges:true"},
			ReadonlyRootfs: false,
		},
		nil, nil, containerName,
	)
	if err != nil {
		return nil, fmt.Errorf("container create: %w", err)
	}

	if err := o.client.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		_ = o.client.ContainerRemove(ctx, resp.ID, container.RemoveOptions{Force: true})
		return nil, fmt.Errorf("container start: %w", err)
	}

	info := &ContainerInfo{
		ID:        resp.ID[:12],
		Name:      containerName,
		Image:     imageName,
		AgentID:   agentID,
		Status:    "running",
		StartedAt: time.Now(),
	}

	o.mu.Lock()
	o.containers[resp.ID[:12]] = info
	o.mu.Unlock()

	return info, nil
}

func (o *Orchestrator) StreamLogs(ctx context.Context, containerID string) (<-chan LogLine, error) {
	// Find full docker ID
	fullID, err := o.resolveContainerID(ctx, containerID)
	if err != nil {
		return nil, err
	}

	reader, err := o.client.ContainerLogs(ctx, fullID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: true,
	})
	if err != nil {
		return nil, fmt.Errorf("container logs: %w", err)
	}

	ch := make(chan LogLine, 100)

	go func() {
		defer close(ch)
		defer reader.Close()

		buf := make([]byte, 4096)
		for {
			n, err := reader.Read(buf)
			if n > 0 {
				// Docker log format: 8-byte header + payload
				payload := string(buf[:n])
				lines := strings.Split(strings.TrimSpace(payload), "\n")
				for _, line := range lines {
					if line == "" {
						continue
					}
					// Strip docker log header (8 bytes)
					clean := line
					if len(line) > 8 {
						clean = line[8:]
					}
					select {
					case ch <- LogLine{
						ContainerID: containerID,
						Text:        clean,
						Stream:      "stdout",
						Timestamp:   time.Now(),
					}:
					case <-ctx.Done():
						return
					}
				}
			}
			if err != nil {
				if err != io.EOF {
					log.Printf("log stream error for %s: %v", containerID, err)
				}
				return
			}
		}
	}()

	o.mu.Lock()
	o.logChannels[containerID] = ch
	o.mu.Unlock()

	return ch, nil
}

func (o *Orchestrator) StopContainer(ctx context.Context, containerID string) error {
	fullID, err := o.resolveContainerID(ctx, containerID)
	if err != nil {
		return err
	}

	timeout := 10
	stopOpts := container.StopOptions{Timeout: &timeout}
	if err := o.client.ContainerStop(ctx, fullID, stopOpts); err != nil {
		return fmt.Errorf("container stop: %w", err)
	}

	o.mu.Lock()
	if info, ok := o.containers[containerID]; ok {
		info.Status = "stopped"
	}
	o.mu.Unlock()

	return nil
}

func (o *Orchestrator) RemoveContainer(ctx context.Context, containerID string) error {
	fullID, err := o.resolveContainerID(ctx, containerID)
	if err != nil {
		return err
	}

	if err := o.client.ContainerRemove(ctx, fullID, container.RemoveOptions{Force: true}); err != nil {
		return fmt.Errorf("container remove: %w", err)
	}

	o.mu.Lock()
	delete(o.containers, containerID)
	delete(o.logChannels, containerID)
	o.mu.Unlock()

	return nil
}

func (o *Orchestrator) WaitForContainer(ctx context.Context, containerID string) (int64, error) {
	fullID, err := o.resolveContainerID(ctx, containerID)
	if err != nil {
		return -1, err
	}

	statusCh, errCh := o.client.ContainerWait(ctx, fullID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return -1, err
		}
	case status := <-statusCh:
		o.mu.Lock()
		if info, ok := o.containers[containerID]; ok {
			info.Status = "stopped"
		}
		o.mu.Unlock()
		return status.StatusCode, nil
	case <-ctx.Done():
		return -1, ctx.Err()
	}
	return -1, nil
}

func (o *Orchestrator) ListContainers() []*ContainerInfo {
	o.mu.RLock()
	defer o.mu.RUnlock()

	result := make([]*ContainerInfo, 0, len(o.containers))
	for _, c := range o.containers {
		result = append(result, c)
	}
	return result
}

func (o *Orchestrator) CleanupAll(ctx context.Context) {
	o.mu.RLock()
	ids := make([]string, 0, len(o.containers))
	for id := range o.containers {
		ids = append(ids, id)
	}
	o.mu.RUnlock()

	for _, id := range ids {
		if err := o.RemoveContainer(ctx, id); err != nil {
			log.Printf("cleanup: failed to remove %s: %v", id, err)
		}
	}
}

func (o *Orchestrator) pullImage(ctx context.Context, imageName string) error {
	reader, err := o.client.ImagePull(ctx, imageName, image.PullOptions{})
	if err != nil {
		return err
	}
	defer reader.Close()
	_, _ = io.Copy(io.Discard, reader)
	return nil
}

func (o *Orchestrator) resolveContainerID(ctx context.Context, shortID string) (string, error) {
	containers, err := o.client.ContainerList(ctx, container.ListOptions{All: true})
	if err != nil {
		return "", err
	}

	for _, c := range containers {
		if strings.HasPrefix(c.ID, shortID) {
			return c.ID, nil
		}
	}

	return shortID, nil
}

func (o *Orchestrator) Close() error {
	return o.client.Close()
}
