FROM oven/bun:1

USER root
WORKDIR /app

# Install Flow CLI to /usr/local/bin
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh \
    && ls -la /root/.local/bin/flow* \
    && cp /root/.local/bin/flow /usr/local/bin/flow \
    && chmod +x /usr/local/bin/flow \
    && /usr/local/bin/flow version \
    && apt-get remove -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy and install deps
COPY mcp-server/package.json mcp-server/bun.lock ./mcp-server/
RUN cd mcp-server && bun install --frozen-lockfile || bun install

# Copy source
COPY mcp-server/src/ ./mcp-server/src/
COPY mcp-server/flow.json ./mcp-server/flow.json
COPY content/ ./content/

# Clone Flow ecosystem docs for MCP search
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && git clone --depth 1 https://github.com/onflow/docs.git /app/external/onflow-docs \
    && apt-get remove -y git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* /app/external/onflow-docs/.git

WORKDIR /app/mcp-server

ENV PORT=3001
ENV FLOW_CMD=/usr/local/bin/flow
EXPOSE 3001

CMD ["bun", "src/http.ts"]
