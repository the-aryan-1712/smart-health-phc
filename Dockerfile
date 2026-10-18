# ─── Stage 1: Python Dependencies ─────────────────────────────────────────────
FROM python:3.11-slim AS python-deps
WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ─── Stage 2: Node.js Builder ──────────────────────────────────────────────────
FROM node:20-alpine AS node-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --ignore-scripts

COPY frontend/ .

# Disable telemetry in build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the standalone Next.js output
RUN npm run build

# ─── Stage 3: Production Runtime ───────────────────────────────────────────────
FROM python:3.11-slim AS runner

# Install Node.js 20, supervisor, and curl (for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Environment
ENV PORT=8080
ENV FASTAPI_PORT=8000
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Create non-root user
RUN groupadd --gid 1001 appgroup \
    && useradd --uid 1001 --gid 1001 --no-create-home appuser

WORKDIR /app

# Copy Python packages from builder
COPY --from=python-deps /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy backend source
COPY backend/ ./backend/

# Copy Next.js standalone build artifacts
COPY --from=node-builder /app/frontend/.next/standalone ./frontend/
COPY --from=node-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=node-builder /app/frontend/public ./frontend/public

# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set ownership
RUN chown -R appuser:appgroup /app

# Health check (Cloud Run needs port 8080)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

EXPOSE 8080

# Run as non-root
USER appuser

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
