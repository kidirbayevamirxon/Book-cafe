# Stage 1: Build & compile TypeScript and native dependencies
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install native compilation dependencies for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Prune devDependencies to keep only production dependencies
RUN npm prune --omit=dev

# Stage 2: Minimal production runtime
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create persistent data directory with node ownership
RUN mkdir -p /app/data && chown -R node:node /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

USER node

EXPOSE 4000

CMD ["node", "dist/index.js"]
