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

export default function NetworkGraph({
  activeAgents,
  containers,
  connections,
  collapsed,
}: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || collapsed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    ctx.clearRect(0, 0, cw, ch);

    // Subtle grid background
    ctx.strokeStyle = "rgba(255,255,255,0.015)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < cw; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ch);
      ctx.stroke();
    }
    for (let y = 0; y < ch; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cw, y);
      ctx.stroke();
    }

    // Layout nodes
    const nodes = new Map<string, NodePos>();
    const activeIds = Array.from(activeAgents.keys());
    const relevantAgents =
      activeIds.length > 0
        ? activeIds
        : agentList.slice(0, 5).map((a) => a.id);
    const centerX = cw / 2;
    const centerY = ch / 2;
    const radius = Math.min(cw, ch) * 0.33;

    relevantAgents.forEach((id, i) => {
      const angle =
        (i / relevantAgents.length) * Math.PI * 2 - Math.PI / 2;
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

    // Container nodes
    const runningContainers = containers.filter(
      (c) => c.status === "running"
    );
    runningContainers.forEach((c, i) => {
      const parentNode = nodes.get(c.agent);
      if (parentNode) {
        const offset = 25 + i * 12;
        const angle =
          Math.atan2(parentNode.y - centerY, parentNode.x - centerX) + 0.5;
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

    // Draw active connections with animated packets
    const activeConns = connections.filter((c) => c.active);
    activeConns.forEach((conn) => {
      const fromNode = nodes.get(conn.from);
      const toNode = nodes.get(conn.to);
      if (fromNode && toNode) {
        // Glowing line
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = fromNode.color + "30";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated packet (multiple)
        for (let p = 0; p < 2; p++) {
          const t = (((tick * 3 + p * 50) % 100) / 100);
          const px = fromNode.x + (toNode.x - fromNode.x) * t;
          const py = fromNode.y + (toNode.y - fromNode.y) * t;

          // Glow
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, 8);
          gradient.addColorStop(0, fromNode.color + "40");
          gradient.addColorStop(1, fromNode.color + "00");
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Packet
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = fromNode.color;
          ctx.fill();
        }

        // Label
        const mx = (fromNode.x + toNode.x) / 2;
        const my = (fromNode.y + toNode.y) / 2;
        ctx.font = "8px monospace";
        ctx.fillStyle = "#555";
        ctx.textAlign = "center";
        ctx.fillText(conn.label, mx, my - 6);
      }
    });

    // Container-to-agent lines
    runningContainers.forEach((c) => {
      const parentNode = nodes.get(c.agent);
      const childNode = nodes.get(`container-${c.id}`);
      if (parentNode && childNode) {
        ctx.beginPath();
        ctx.moveTo(parentNode.x, parentNode.y);
        ctx.lineTo(childNode.x, childNode.y);
        ctx.strokeStyle = "#00d4ff15";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Agent-to-agent idle connections
    for (let i = 0; i < relevantAgents.length; i++) {
      for (let j = i + 1; j < relevantAgents.length; j++) {
        const a = nodes.get(relevantAgents[i]);
        const b = nodes.get(relevantAgents[j]);
        if (a?.active && b?.active) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(255,255,255,0.025)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach((node) => {
      const r = node.type === "agent" ? 14 : 7;

      // Outer glow for active agents
      if (node.active && node.type === "agent") {
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          r,
          node.x,
          node.y,
          r + 12
        );
        gradient.addColorStop(0, node.color + "20");
        gradient.addColorStop(1, node.color + "00");
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 12, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.active ? node.color + "25" : "#1a1a2e";
      ctx.fill();
      ctx.strokeStyle = node.active ? node.color + "50" : "#333";
      ctx.lineWidth = node.active ? 1.5 : 1;
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
      ctx.font =
        node.type === "agent" ? "bold 8px monospace" : "7px monospace";
      ctx.fillStyle = node.active ? node.color : "#555";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(node.label, node.x, node.y + r + 4);
    });

    // Centre radar pulse (when active)
    if (activeConns.length > 0) {
      const pulseRadius = ((tick * 2) % 120) * 0.8;
      const pulseOpacity = Math.max(0, 0.1 - pulseRadius * 0.001);
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,${pulseOpacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [activeAgents, containers, connections, collapsed, tick]);

  if (collapsed) return null;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#08080d] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="text-[10px] font-mono text-[#555]">
          🔗 Network Graph
        </span>
        <span className="text-[9px] text-[#444] ml-auto">
          {connections.filter((c) => c.active).length} active
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
