#!/bin/bash

# Deployment script for trading bot platform
# This script handles the deployment process on the server

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# Load environment variables
source .env

# Backup current containers (optional)
echo -e "${YELLOW}📦 Creating backup of current deployment...${NC}"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Export current database (if container is running)
if docker-compose ps | grep -q "backend.*Up"; then
    echo "💾 Backing up database..."
    docker-compose exec -T postgres pg_dump -U ${POSTGRES_USER:-postgres} ${POSTGRES_DB:-trading_bot} > "$BACKUP_DIR/database_backup.sql" 2>/dev/null || true
fi

# Stop and remove old containers
echo -e "${YELLOW}🛑 Stopping current containers...${NC}"
docker-compose down --remove-orphans || true

# Pull latest images (if using registry)
if [ ! -z "$BACKEND_IMAGE" ] && [ ! -z "$FRONTEND_IMAGE" ]; then
    echo -e "${YELLOW}📥 Using pre-built images from registry...${NC}"

    # Update docker-compose.yml to use registry images
    cat > docker-compose.override.yml << EOL
version: '3.8'
services:
  backend:
    image: ${BACKEND_IMAGE}
    build: null
  frontend:
    image: ${FRONTEND_IMAGE}
    build: null
EOL
    echo "✅ Override file created"
else
    echo -e "${YELLOW}🔨 Building images locally...${NC}"
    docker-compose build --no-cache
fi

# Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check if backend is running
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose ps | grep -q "backend.*Up"; then
        echo -e "${GREEN}✅ Backend is running${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "Waiting for backend... (${ATTEMPT}/${MAX_ATTEMPTS})"
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    docker-compose logs backend
    exit 1
fi

# Check if frontend is running
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose ps | grep -q "frontend.*Up"; then
        echo -e "${GREEN}✅ Frontend is running${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "Waiting for frontend... (${ATTEMPT}/${MAX_ATTEMPTS})"
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    docker-compose logs frontend
    exit 1
fi

# Show running containers
echo -e "${GREEN}📊 Running containers:${NC}"
docker-compose ps

# Show logs
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker-compose logs --tail=50

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost (port 80)"
echo "   Backend API: http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f [service_name]"
echo "   Restart service: docker-compose restart [service_name]"
echo "   Stop all: docker-compose down"
echo "   Check status: docker-compose ps"
