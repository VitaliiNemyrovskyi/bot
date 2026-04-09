# Multi-stage build for Backend
# Build context is the repository root so the sibling `shared/` package is reachable.

FROM node:20-alpine AS deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Builder stage with full dev deps
FROM node:20-alpine AS builder
WORKDIR /app
# Sibling package referenced via tsconfig path "@shared/lib" -> "../shared/lib"
COPY shared ./shared
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Standalone output (with outputFileTracingRoot=repo root) lays files out as
#   /app/backend/.next/standalone/backend/server.js
#   /app/backend/.next/standalone/shared/...
#   /app/backend/.next/standalone/node_modules/...
# Copy that tree to /app so server.js ends up at /app/backend/server.js.
COPY --from=builder /app/backend/.next/standalone ./
COPY --from=builder /app/backend/.next/static ./backend/.next/static
COPY --from=builder /app/backend/public ./backend/public
COPY --from=builder /app/backend/prisma ./backend/prisma

# Overlay the full node_modules from the builder so the Prisma CLI (used at
# startup for `migrate deploy`) has all of its transitive dependencies. This
# replaces the trimmed standalone node_modules but is the simplest reliable way
# to keep both `node server.js` and the Prisma CLI working in one image.
COPY --from=builder /app/backend/node_modules ./backend/node_modules

USER nextjs

WORKDIR /app/backend

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
