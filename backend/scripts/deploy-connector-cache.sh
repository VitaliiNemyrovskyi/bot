#!/bin/bash

# Connector Cache Deployment Script
# Usage: ./scripts/deploy-connector-cache.sh

set -e  # Exit on error

echo "========================================="
echo "  Connector Cache Deployment Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Must be run from backend directory${NC}"
  exit 1
fi

# Step 1: Database Migration
echo -e "${YELLOW}Step 1: Running Prisma migration...${NC}"
npx prisma migrate dev --name add_connector_state_cache

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database migration completed${NC}"
else
  echo -e "${RED}✗ Migration failed${NC}"
  exit 1
fi

echo ""

# Step 2: Generate Prisma Client
echo -e "${YELLOW}Step 2: Generating Prisma client...${NC}"
npx prisma generate

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Prisma client generated${NC}"
else
  echo -e "${RED}✗ Client generation failed${NC}"
  exit 1
fi

echo ""

# Step 3: Run Tests
echo -e "${YELLOW}Step 3: Running tests...${NC}"
npm test -- src/services/__tests__/connector-state-cache.service.test.ts --passWithNoTests

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Tests passed${NC}"
else
  echo -e "${RED}✗ Tests failed${NC}"
  exit 1
fi

echo ""

# Step 4: Build
echo -e "${YELLOW}Step 4: Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi

echo ""

# Step 5: Verify Database Schema
echo -e "${YELLOW}Step 5: Verifying database schema...${NC}"
npx prisma db pull --force > /dev/null 2>&1

# Check if connector_state_cache table exists
TABLE_EXISTS=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as count FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'connector_state_cache';
EOF
)

if [[ $TABLE_EXISTS == *"1"* ]]; then
  echo -e "${GREEN}✓ connector_state_cache table verified${NC}"
else
  echo -e "${RED}✗ Table not found in database${NC}"
  exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}  Deployment Completed Successfully!${NC}"
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Update FundingArbitrageService to use cached connectors"
echo "2. Monitor logs for cache hit/miss rates"
echo "3. Check performance metrics"
echo ""
echo "Documentation:"
echo "  - Implementation Guide: CONNECTOR_CACHE_IMPLEMENTATION_GUIDE.md"
echo "  - Architecture Doc: CONNECTOR_CACHE_ARCHITECTURE.md"
echo ""
echo "Monitoring:"
echo "  - Check cache stats: ConnectorStateCacheService.getStats()"
echo "  - View logs: Look for '[ConnectorStateCache]' entries"
echo ""
echo -e "${GREEN}Ready for production use!${NC}"
