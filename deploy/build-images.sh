#!/usr/bin/env bash
set -euo pipefail

echo "=== Harbinger: Building Security Tool Images ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Build tool images
images=(
  "recon:harbinger/recon:latest"
  "scanner:harbinger/scanner:latest"
  "cloud:harbinger/cloud:latest"
  "osint:harbinger/osint:latest"
  "exploit:harbinger/exploit:latest"
)

for entry in "${images[@]}"; do
  dir="${entry%%:*}"
  tag="${entry#*:}"
  echo "Building $tag from docker/$dir..."
  docker build -t "$tag" "$ROOT_DIR/docker/$dir"
  echo "  ✓ $tag built"
  echo ""
done

echo "=== Building Application Images ==="
echo ""

# Build backend
echo "Building harbinger/api:latest..."
docker build -t harbinger/api:latest -f "$ROOT_DIR/deploy/Dockerfile.backend" "$ROOT_DIR/backend"
echo "  ✓ harbinger/api:latest built"
echo ""

# Build frontend
echo "Building harbinger/frontend:latest..."
docker build -t harbinger/frontend:latest -f "$ROOT_DIR/deploy/Dockerfile.frontend" "$ROOT_DIR"
echo "  ✓ harbinger/frontend:latest built"
echo ""

echo "=== All images built successfully ==="
echo ""
echo "Start the stack with:"
echo "  docker compose up -d"
