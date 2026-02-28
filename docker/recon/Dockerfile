FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git build-base

# Install Go-based recon tools
RUN go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest && \
    go install github.com/projectdiscovery/httpx/cmd/httpx@latest && \
    go install github.com/projectdiscovery/dnsx/cmd/dnsx@latest && \
    go install github.com/owasp-amass/amass/v4/...@latest

FROM alpine:3.20

RUN apk add --no-cache \
    bash \
    curl \
    wget \
    jq \
    nmap \
    nmap-scripts \
    bind-tools \
    whois \
    python3 \
    py3-pip \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Install Python-based tools
RUN pip3 install --no-cache-dir --break-system-packages \
    whatweb-py \
    dirsearch

# Copy Go binaries from builder
COPY --from=builder /go/bin/subfinder /usr/local/bin/
COPY --from=builder /go/bin/httpx /usr/local/bin/
COPY --from=builder /go/bin/dnsx /usr/local/bin/
COPY --from=builder /go/bin/amass /usr/local/bin/

# Create non-root user
RUN adduser -D -h /home/harbinger harbinger
USER harbinger
WORKDIR /home/harbinger

# Output directory for results
RUN mkdir -p /home/harbinger/output

LABEL maintainer="harbinger" \
      description="Harbinger Recon Agent - subfinder, httpx, amass, nmap, dnsx" \
      harbinger.agent="pathfinder"

ENTRYPOINT ["/bin/bash", "-c"]
