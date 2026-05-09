#!/bin/bash
# startup.sh - Start local development environment

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "
╔════════════════════════════════════════════╗
║   Khalia MVP - Local Development Startup   ║
╚════════════════════════════════════════════╝
"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}✗ npm not found. Please install npm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}✗ PostgreSQL not found. Please install PostgreSQL 14+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}✗ Redis not found. Please install Redis 6.0+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Redis found${NC}"

echo ""
echo -e "${BLUE}Setting up development environment...${NC}"

# Start PostgreSQL (macOS/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}Starting PostgreSQL (macOS)...${NC}"
    brew services start postgresql 2>/dev/null || echo "PostgreSQL may already be running"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "${BLUE}Starting PostgreSQL (Linux)...${NC}"
    sudo systemctl start postgresql 2>/dev/null || echo "PostgreSQL may already be running"
fi

# Start Redis
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}Starting Redis (macOS)...${NC}"
    brew services start redis 2>/dev/null || echo "Redis may already be running"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "${BLUE}Starting Redis (Linux)...${NC}"
    sudo systemctl start redis-server 2>/dev/null || echo "Redis may already be running"
fi

# Create database if not exists
echo -e "${BLUE}Setting up database...${NC}"
createdb khalia_dev 2>/dev/null || echo "Database khalia_dev already exists"

# Backend setup
echo ""
echo -e "${BLUE}Setting up backend...${NC}"
cd "$PROJECT_DIR/backend"

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/khalia_dev

# Auth
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production

# Redis
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
PORT=3000
API_VERSION=v1
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Optional (for payment/email)
PAYSTACK_SECRET_KEY=sk_test_xxxxx
SENDGRID_API_KEY=SG.xxxxx
EOF
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Run migrations
echo -e "${BLUE}Running database migrations...${NC}"
npm run migrate:latest 2>/dev/null || echo "Migrations already run or schema up-to-date"

# Frontend setup
echo ""
echo -e "${BLUE}Setting up frontend...${NC}"
cd "$PROJECT_DIR"

# Create .env.local if doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << 'EOF'
REACT_APP_API_URL=http://localhost:3000/api/v1
EOF
    echo -e "${GREEN}✓ Created .env.local file${NC}"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Starting development servers...${NC}"
echo ""

# Start backend in background
echo -e "${YELLOW}Starting backend on port 3000...${NC}"
cd "$PROJECT_DIR/backend"
npm run dev > /tmp/khalia-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Backend may not have started. Check logs:${NC}"
    echo -e "${YELLOW}  tail -f /tmp/khalia-backend.log${NC}"
fi

# Start frontend in background
echo -e "${YELLOW}Starting frontend on port 5173...${NC}"
cd "$PROJECT_DIR"
npm run dev > /tmp/khalia-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All services running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Access points:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:3000${NC}"
echo -e "  API:       ${GREEN}http://localhost:3000/api/v1${NC}"
echo ""
echo -e "${BLUE}Testing credentials:${NC}"
echo -e "  Email:     test@khalia.com"
echo -e "  Password:  Test1234!"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  Backend:   ${YELLOW}tail -f /tmp/khalia-backend.log${NC}"
echo -e "  Frontend:  ${YELLOW}tail -f /tmp/khalia-frontend.log${NC}"
echo ""
echo -e "${BLUE}Stop services:${NC}"
echo -e "  ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo -e "  Setup:     ${YELLOW}./TESTING.md${NC}"
echo -e "  Deployment:${YELLOW}./DEPLOYMENT.md${NC}"
echo -e "  API Docs:  ${YELLOW}./backend/API.md${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Open http://localhost:5173 in your browser"
echo -e "  2. Create a new account"
echo -e "  3. Complete the onboarding flow"
echo -e "  4. Explore the dashboard"
echo ""

# Keep script running
wait
