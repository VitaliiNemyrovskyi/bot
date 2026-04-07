#!/bin/bash

# Server setup script for trading bot platform
# Run this script on a fresh Ubuntu/Debian server to prepare it for deployment

set -e

echo "🚀 Setting up server for trading bot deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban \
    htop

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Set up stable repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    echo -e "${GREEN}✅ Docker installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker is already installed${NC}"
fi

# Install Docker Compose (standalone)
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="2.24.5"
    curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker Compose is already installed${NC}"
fi

# Create deployment user
echo -e "${YELLOW}👤 Setting up deployment user...${NC}"
DEPLOY_USER="deploy"
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    echo -e "${GREEN}✅ User '$DEPLOY_USER' created${NC}"
else
    echo -e "${GREEN}✅ User '$DEPLOY_USER' already exists${NC}"
fi

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
APP_DIR="/opt/trading-bot"
mkdir -p "$APP_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
chmod 755 "$APP_DIR"

# Create backups directory
mkdir -p "$APP_DIR/backups"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/backups"

# Setup SSH for deployment user
echo -e "${YELLOW}🔑 Setting up SSH for deployment...${NC}"
sudo -u "$DEPLOY_USER" mkdir -p "/home/$DEPLOY_USER/.ssh"
sudo -u "$DEPLOY_USER" chmod 700 "/home/$DEPLOY_USER/.ssh"

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys${NC}"
echo "Example: echo 'your-ssh-public-key' >> /home/$DEPLOY_USER/.ssh/authorized_keys"
echo ""

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3000/tcp # Backend API (optional, for direct access)

echo -e "${GREEN}✅ Firewall configured${NC}"

# Configure fail2ban
echo -e "${YELLOW}🛡️  Configuring fail2ban...${NC}"
systemctl start fail2ban
systemctl enable fail2ban

# Set up log rotation for Docker
echo -e "${YELLOW}📝 Configuring Docker log rotation...${NC}"
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker

# Create environment template
echo -e "${YELLOW}📄 Creating environment template...${NC}"
cat > "$APP_DIR/.env.template" << 'EOF'
# Node Environment
NODE_ENV=production

# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=trading_bot

# Database URL (used by Prisma)
DATABASE_URL=postgresql://postgres:CHANGE_ME_STRONG_PASSWORD@postgres:5432/trading_bot?schema=public

# JWT Configuration
JWT_SECRET=CHANGE_ME_RANDOM_STRING_64_CHARS

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://your-domain.com

# Encryption Key (for storing API credentials)
ENCRYPTION_KEY=CHANGE_ME_RANDOM_STRING_32_CHARS

# Bybit API (Optional)
BYBIT_API_KEY=
BYBIT_API_SECRET=
EOF

chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env.template"

# Create monitoring script
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"
cat > "$APP_DIR/monitor.sh" << 'EOF'
#!/bin/bash
cd /opt/trading-bot
echo "=== Docker Containers Status ==="
docker-compose ps
echo ""
echo "=== Disk Usage ==="
df -h | grep -E '^/dev/'
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Docker Disk Usage ==="
docker system df
EOF

chmod +x "$APP_DIR/monitor.sh"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/monitor.sh"

# Setup automatic updates (optional)
echo -e "${YELLOW}🔄 Configuring automatic security updates...${NC}"
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Create systemd service for auto-restart on boot
echo -e "${YELLOW}⚙️  Creating systemd service...${NC}"
cat > /etc/systemd/system/trading-bot.service << EOF
[Unit]
Description=Trading Bot Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=$DEPLOY_USER
Group=$DEPLOY_USER

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable trading-bot.service

echo ""
echo -e "${GREEN}✅ Server setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "2. Copy and configure the environment file:"
echo "   sudo -u $DEPLOY_USER cp $APP_DIR/.env.template $APP_DIR/.env"
echo "   sudo -u $DEPLOY_USER nano $APP_DIR/.env"
echo "3. Configure GitHub Actions secrets:"
echo "   - SSH_PRIVATE_KEY: Your private SSH key"
echo "   - STAGING_SERVER_HOST: Your server IP/hostname"
echo "   - STAGING_SERVER_USER: $DEPLOY_USER"
echo "   - PRODUCTION_SERVER_HOST: Your production server IP/hostname (if different)"
echo "   - PRODUCTION_SERVER_USER: $DEPLOY_USER"
echo "4. Deploy your application via GitHub Actions or manually"
echo ""
echo "📊 Monitoring:"
echo "   - View status: sudo -u $DEPLOY_USER $APP_DIR/monitor.sh"
echo "   - View logs: cd $APP_DIR && docker-compose logs -f"
echo ""
echo "🔒 Security:"
echo "   - Firewall is enabled with ports 22, 80, 443, 3000 open"
echo "   - Fail2ban is enabled for SSH protection"
echo "   - Automatic security updates are enabled"
echo ""
