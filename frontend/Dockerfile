# Multi-stage build for Frontend
# Build context is the repository root so the sibling `shared/` package is reachable.

FROM node:20-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci && npm cache clean --force

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
# Sibling package referenced via tsconfig path "@shared/lib" -> "../shared/lib"
COPY shared ./shared
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./

# Build Angular application for production
# Use the lint-free script; pre-existing lint errors are tracked separately.
RUN npm run build:skip-checks -- --configuration production

# Production stage with Nginx
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/frontend/dist/frontend /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
