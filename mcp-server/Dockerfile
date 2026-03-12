# Stage 1: Build Cadence LSP v2 binary
FROM golang:1.25-bookworm AS lsp-builder

RUN apt-get update && apt-get install -y --no-install-recommends git gcc libc-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /build
# ADD fetches latest commit info — if it changed, Docker invalidates the cache
ADD https://api.github.com/repos/Outblock/cadence-tools/commits/master /tmp/lsp-commit.json
RUN git clone --depth 1 --branch master https://github.com/Outblock/cadence-tools.git . && git log --oneline -1

WORKDIR /build/languageserver
RUN CGO_ENABLED=1 go build -o /lsp-v2 ./cmd/lsp-v2/

# Stage 2: Runtime
FROM oven/bun:1

USER root
WORKDIR /app

# Install Flow CLI to /usr/local/bin (still needed for `flow dependencies install`)
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

# Copy LSP v2 binary from builder
COPY --from=lsp-builder /lsp-v2 /usr/local/bin/lsp-v2
RUN chmod +x /usr/local/bin/lsp-v2

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
ENV LSP_BINARY=/usr/local/bin/lsp-v2
EXPOSE 3001

CMD ["bun", "src/http.ts"]
