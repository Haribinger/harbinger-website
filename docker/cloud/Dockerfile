FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    wget \
    jq \
    git \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2
RUN curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip -q awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip

# Install cloud security tools
RUN pip install --no-cache-dir \
    prowler \
    scoutsuite \
    cloudsplaining \
    checkov \
    steampipe

# Install GCloud CLI
RUN curl -s https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz | tar -xz -C /opt && \
    /opt/google-cloud-sdk/install.sh --quiet --usage-reporting=false && \
    ln -s /opt/google-cloud-sdk/bin/gcloud /usr/local/bin/gcloud || true

# Create non-root user
RUN useradd -m -s /bin/bash harbinger
USER harbinger
WORKDIR /home/harbinger

RUN mkdir -p /home/harbinger/output

LABEL maintainer="harbinger" \
      description="Harbinger Cloud Agent - prowler, scoutsuite, checkov, aws-cli" \
      harbinger.agent="phantom"

ENTRYPOINT ["/bin/bash", "-c"]
