FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    wget \
    jq \
    git \
    whois \
    dnsutils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install OSINT tools
RUN pip install --no-cache-dir \
    theHarvester \
    sherlock-project \
    spiderfoot \
    shodan \
    censys \
    holehe \
    maigret

# Create non-root user
RUN useradd -m -s /bin/bash harbinger
USER harbinger
WORKDIR /home/harbinger

RUN mkdir -p /home/harbinger/output

LABEL maintainer="harbinger" \
      description="Harbinger OSINT Agent - theHarvester, sherlock, shodan, censys" \
      harbinger.agent="specter"

ENTRYPOINT ["/bin/bash", "-c"]
