import { agentList, getAgent } from "@/lib/demo/agents";
import type { AgentId, DockerContainer, NetworkConnection } from "@/lib/demo/types";
import { useEffect, useRef, useState } from "react";

interface NetworkGraphProps {
  activeAgents: Map<AgentId, string>;
  containers: DockerContainer[];
  connections: NetworkConnection[];
  collapsed?: boolean;
}

interface NodePos {
  x: number;
  y: number;
  color: string;
  label: string;
  active: boolean;
  type: "agent" | "container" | "target";
}

export default function NetworkGraph({ activeAgents, containers, connections, collapsed }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || collapsed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    ctx.clearRect(0, 0, cw, ch);

    // Layout nodes in a circle
    const nodes = new Map<string, NodePos>();
    const activeIds = Array.from(activeAgents.keys());
    const relevantAgents = activeIds.length > 0 ? activeIds : agentList.slice(0, 5).map((a) => a.id);
    const centerX = cw / 2;
    const centerY = ch / 2;
    const radius = Math.min(cw, ch) * 0.35;

    relevantAgents.forEach((id, i) => {
      const angle = (i / relevantAgents.length) * Math.PI * 2 - Math.PI / 2;
      const agent = getAgent(id);
      nodes.set(id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        color: agent.color,
        label: agent.name,
        active: activeAgents.has(id),
        type: "agent",
      });
    });

    // Add containers as smaller nodes near their agent
    const runningContainers = containers.filter((c) => c.status === "running");
    runningContainers.forEach((c, i) => {
      const parentNode = nodes.get(c.agent);
      if (parentNode) {
        const offset = 25 + i * 12;
        const angle = Math.atan2(parentNode.y - centerY, parentNode.x - centerX) + 0.5;
        nodes.set(`container-${c.id}`, {
          x: parentNode.x + Math.cos(angle) * offset,
          y: parentNode.y + Math.sin(angle) * offset,
          color: "#00d4ff",
          label: c.name.slice(0, 8),
          active: true,
          type: "container",
        });
      }
    });

    // Draw connections
    const activeConns = connections.filter((c) => c.active);
    activeConns.forEach((conn) => {
      const fromNode = nodes.get(conn.from);
      const toNode = nodes.get(conn.to);
      if (fromNode && toNode) {
        // Line
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = fromNode.color + "40";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Animated packet
        const t = ((tick * 3) % 100) / 100;
        const px = fromNode.x + (toNode.x - fromNode.x) * t;
        const py = fromNode.y + (toNode.y - fromNode.y) * t;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = fromNode.color;
        ctx.fill();

        // Label
        const mx = (fromNode.x + toNode.x) / 2;
        const my = (fromNode.y + toNode.y) / 2;
        ctx.font = "8px monospace";
        ctx.fillStyle = "#555";
        ctx.textAlign = "center";
        ctx.fillText(conn.label, mx, my - 5);
      }
    });

    // Draw container-to-agent lines
    runningContainers.forEach((c) => {
      const parentNode = nodes.get(c.agent);
      const childNode = nodes.get(`container-${c.id}`);
      if (parentNode && childNode) {
        ctx.beginPath();
        ctx.moveTo(parentNode.x, parentNode.y);
        ctx.lineTo(childNode.x, childNode.y);
        ctx.strokeStyle = "#00d4ff20";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw agent-to-agent idle connections
    for (let i = 0; i < relevantAgents.length; i++) {
      for (let j = i + 1; j < relevantAgents.length; j++) {
        const a = nodes.get(relevantAgents[i])!;
        const b = nodes.get(relevantAgents[j])!;
        if (a.active && b.active) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach((node) => {
      const r = node.type === "agent" ? 12 : 6;

      // Glow for active
      if (node.active) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "15";
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.active ? node.color + "30" : "#1a1a2e";
      ctx.fill();
      ctx.strokeStyle = node.active ? node.color + "60" : "#333";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Container icon
      if (node.type === "container") {
        ctx.font = "7px monospace";
        ctx.fillStyle = "#00d4ff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🐳", node.x, node.y);
      }

      // Label
      ctx.font = node.type === "agent" ? "bold 8px monospace" : "7px monospace";
      ctx.fillStyle = node.active ? node.color : "#555";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(node.label, node.x, node.y + r + 3);
    });
  }, [activeAgents, containers, connections, collapsed, tick]);

  if (collapsed) return null;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#08080d] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="text-[10px] font-mono text-[#555]">🔗 Network Graph</span>
        <span className="text-[9px] text-[#444] ml-auto">
          {connections.filter((c) => c.active).length} active connections
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[200px]"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
