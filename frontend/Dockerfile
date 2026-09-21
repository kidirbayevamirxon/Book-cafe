# Stage 1: Build static assets
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve with 'serve'
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install 'serve' globally
RUN npm install -g serve

# Run as non-root node user
USER node

# Copy built static assets from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

# Serve SPA with single-page application fallback (-s) on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
