# syntax=docker/dockerfile:1.7
#
# Multi-stage Dockerfile for @restaurant/api (NestJS)
# ─────────────────────────────────────────────────────
# Stage 1 (deps)   – install all workspace deps with pnpm
# Stage 2 (build)  – compile TypeScript
# Stage 3 (runner) – lean production image (no dev deps)
#

# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests first (layer cache-friendly)
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./

# Copy package.json of every workspace package that api depends on
COPY packages/contracts/package.json       packages/contracts/
COPY packages/api-client/package.json      packages/api-client/
COPY packages/database/package.json        packages/database/
COPY packages/config/package.json          packages/config/
COPY apps/api/package.json                 apps/api/

# Frozen install (CI safe)
RUN pnpm install --frozen-lockfile --prod=false

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

# Copy all source files
COPY . .

# Compile TypeScript and build shared packages
RUN pnpm --filter @restaurant/contracts build && \
    pnpm --filter @restaurant/database build && \
    pnpm --filter @restaurant/api build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Only copy production dependencies
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./
COPY packages/contracts/package.json       packages/contracts/
COPY packages/api-client/package.json      packages/api-client/
COPY packages/database/package.json        packages/database/
COPY packages/config/package.json          packages/config/
COPY apps/api/package.json                 apps/api/

RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from build stage
COPY --from=build /app/packages/contracts/dist   packages/contracts/dist
COPY --from=build /app/packages/database/dist    packages/database/dist
COPY --from=build /app/apps/api/dist             apps/api/dist

# Prisma client (generated artefact)
COPY --from=build /app/packages/database/prisma  packages/database/prisma
COPY --from=build /app/node_modules/.pnpm        node_modules/.pnpm

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
