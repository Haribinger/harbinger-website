FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git build-base

# Install Go-based scanning tools
RUN go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest && \
    go install github.com/projectdiscovery/katana/cmd/katana@latest

FROM alpine:3.20

RUN apk add --no-cache \
    bash \
    curl \
    wget \
    jq \
    python3 \
    py3-pip \
    git \
    perl \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Install Python-based scanning tools
RUN pip3 install --no-cache-dir --break-system-packages \
    sqlmap \
    xsstrike \
    commix

# Copy Go binaries
COPY --from=builder /go/bin/nuclei /usr/local/bin/
COPY --from=builder /go/bin/katana /usr/local/bin/

# Download nuclei templates
RUN nuclei -update-templates 2>/dev/null || true

# Install nikto
RUN cd /opt && \
    git clone --depth=1 https://github.com/sullo/nikto.git && \
    ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto && \
    chmod +x /opt/nikto/program/nikto.pl

# Create non-root user
RUN adduser -D -h /home/harbinger harbinger
USER harbinger
WORKDIR /home/harbinger

RUN mkdir -p /home/harbinger/output

LABEL maintainer="harbinger" \
      description="Harbinger Scanner Agent - nuclei, sqlmap, nikto, xsstrike" \
      harbinger.agent="breach"

ENTRYPOINT ["/bin/bash", "-c"]
