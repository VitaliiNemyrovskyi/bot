# Docker Compose Deployment Guide

Simple deployment guide for deploying the Trading Bot Platform to any cloud server (DigitalOcean, Linode, Hetzner, AWS EC2, etc.) using Docker Compose.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Server Setup](#server-setup)
4. [GitHub Actions Configuration](#github-actions-configuration)
5. [Manual Deployment](#manual-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## Overview

This deployment approach uses:
- **Docker Compose** for orchestration
- **GitHub Container Registry (GHCR)** for storing Docker images
- **GitHub Actions** for CI/CD
- **SSH** for deployment
- **Simple cloud server** (any Ubuntu/Debian VPS)

### Architecture

```
┌─────────────────────────────────────────────────┐
│           GitHub Actions (CI/CD)                │
│  - Run tests                                    │
│  - Build Docker images                          │
│  - Push to GHCR                                 │
│  - SSH to server                                │
│  - Deploy with docker-compose                   │
└─────────────────────────────────────────────────┘
                      │
                      ├─ SSH ─┐
                      │        │
┌─────────────────────▼────────▼─────────────────┐
│         Cloud Server (VPS)                      │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Frontend (Nginx) :80                    │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Backend (Next.js) :3000                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  PostgreSQL :5432                        │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Prerequisites

### Local Machine
- Git
- SSH key pair

### Cloud Server
- Ubuntu 20.04+ or Debian 11+ (recommended)
- Minimum 2GB RAM, 2 CPU cores, 20GB disk
- Root or sudo access
- Public IP address

### GitHub
- GitHub account with repository access
- GitHub Actions enabled

## Server Setup

### Option 1: Automated Setup (Recommended)

1. **Connect to your server:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Download and run the setup script:**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/scripts/setup-server.sh -o setup-server.sh
   chmod +x setup-server.sh
   sudo bash setup-server.sh
   ```

3. **Add your SSH public key:**
   ```bash
   # On your local machine, copy your public key
   cat ~/.ssh/id_rsa.pub

   # On the server, add it to deploy user's authorized_keys
   echo "your-public-key-here" >> /home/deploy/.ssh/authorized_keys
   chmod 600 /home/deploy/.ssh/authorized_keys
   chown deploy:deploy /home/deploy/.ssh/authorized_keys
   ```

4. **Configure environment variables:**
   ```bash
   sudo -u deploy cp /opt/trading-bot/.env.template /opt/trading-bot/.env
   sudo -u deploy nano /opt/trading-bot/.env
   ```

### Option 2: Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

1. **Update system:**
   ```bash
   apt-get update && apt-get upgrade -y
   ```

2. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   systemctl start docker
   systemctl enable docker
   ```

3. **Install Docker Compose:**
   ```bash
   DOCKER_COMPOSE_VERSION="2.24.5"
   curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

4. **Create deployment user:**
   ```bash
   useradd -m -s /bin/bash deploy
   usermod -aG docker deploy
   ```

5. **Create application directory:**
   ```bash
   mkdir -p /opt/trading-bot
   chown -R deploy:deploy /opt/trading-bot
   ```

6. **Configure firewall:**
   ```bash
   ufw allow ssh
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw --force enable
   ```

</details>

## GitHub Actions Configuration

### 1. Generate SSH Key Pair

On your local machine:

```bash
# Generate a new SSH key for deployment
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/github_deploy_key.pub deploy@your-server-ip
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**, and add:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key content | Content of `~/.ssh/github_deploy_key` |
| `STAGING_SERVER_HOST` | Server IP or hostname | `123.45.67.89` or `staging.example.com` |
| `STAGING_SERVER_USER` | SSH username | `deploy` |
| `PRODUCTION_SERVER_HOST` | Production server IP | `98.76.54.32` or `app.example.com` |
| `PRODUCTION_SERVER_USER` | SSH username | `deploy` |

**To get your private key:**
```bash
cat ~/.ssh/github_deploy_key
# Copy the entire output including BEGIN and END lines
```

### 3. Enable GitHub Packages

The workflow uses GitHub Container Registry (GHCR) which is automatically available. Your images will be stored at:
- `ghcr.io/YOUR_USERNAME/YOUR_REPO/backend:latest`
- `ghcr.io/YOUR_USERNAME/YOUR_REPO/frontend:latest`

### 4. Workflow File

The workflow is already created at `.github/workflows/deploy-docker-compose.yml`. It will:
- Run tests on every push
- Build and push Docker images to GHCR
- Deploy to server when pushing to `main` or `production` branches

### 5. Trigger Deployment

```bash
# Push to main branch to deploy to staging
git push origin main

# Push to production branch to deploy to production
git push origin production

# Or trigger manually from GitHub Actions tab
```

## Manual Deployment

### Initial Deployment

1. **Clone repository on server:**
   ```bash
   ssh deploy@your-server-ip
   cd /opt/trading-bot
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   nano .env
   ```

   Update the following required variables:
   ```env
   POSTGRES_PASSWORD=your-strong-password
   JWT_SECRET=random-64-char-string
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ENCRYPTION_KEY=random-32-char-string
   ```

3. **Build and start services:**
   ```bash
   docker-compose up -d --build
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

5. **Check status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Update Deployment

```bash
ssh deploy@your-server-ip
cd /opt/trading-bot

# Pull latest changes
git pull origin main

# Run deployment script
bash scripts/deploy.sh

# Or manually
docker-compose pull
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

## Monitoring & Maintenance

### View Service Status

```bash
# Check all containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# View last 100 lines
docker-compose logs --tail=100
```

### Resource Monitoring

```bash
# System resources
ssh deploy@your-server-ip
/opt/trading-bot/monitor.sh

# Docker stats
docker stats

# Disk usage
df -h
docker system df
```

### Database Management

**Backup database:**
```bash
docker-compose exec postgres pg_dump -U postgres trading_bot > backup_$(date +%Y%m%d).sql
```

**Restore database:**
```bash
docker-compose exec -T postgres psql -U postgres trading_bot < backup_20240101.sql
```

**Access database shell:**
```bash
docker-compose exec postgres psql -U postgres trading_bot
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

### Update Docker Images

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# Remove old images
docker image prune -f
```

## SSL/TLS Configuration (HTTPS)

### Using Let's Encrypt with Certbot

1. **Install Certbot:**
   ```bash
   apt-get install certbot python3-certbot-nginx
   ```

2. **Get certificate:**
   ```bash
   certbot certonly --standalone -d your-domain.com -d www.your-domain.com
   ```

3. **Update nginx.conf** (frontend/nginx.conf):
   ```nginx
   server {
       listen 80;
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       # ... rest of configuration
   }
   ```

4. **Update docker-compose.yml** to mount certificates:
   ```yaml
   frontend:
     volumes:
       - /etc/letsencrypt:/etc/letsencrypt:ro
     ports:
       - "443:443"
   ```

5. **Restart frontend:**
   ```bash
   docker-compose restart frontend
   ```

## Backup Strategy

### Automated Backups

Create a backup script:

```bash
cat > /opt/trading-bot/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/trading-bot/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
docker-compose exec -T postgres pg_dump -U postgres trading_bot | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup environment file
cp .env "$BACKUP_DIR/env_$DATE.backup"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "env_*.backup" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/trading-bot/backup.sh
```

Add to crontab:
```bash
crontab -e
# Add: Run backup daily at 2 AM
0 2 * * * /opt/trading-bot/backup.sh >> /opt/trading-bot/backup.log 2>&1
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps

# Restart service
docker-compose restart backend
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
docker-compose exec backend npx prisma db execute --stdin <<< "SELECT 1"
```

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :3000

# Stop the service or change port in docker-compose.yml
```

### Out of Disk Space

```bash
# Check disk usage
df -h
docker system df

# Clean up Docker
docker system prune -a
docker volume prune

# Remove old backups
find /opt/trading-bot/backups -mtime +30 -delete
```

### Memory Issues

```bash
# Check memory usage
free -h
docker stats

# Restart services to free memory
docker-compose restart

# Add swap if needed
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### SSH Connection Refused

```bash
# Check SSH service
systemctl status ssh

# Check firewall
ufw status

# Verify authorized_keys permissions
ls -la /home/deploy/.ssh/
```

### Deployment Script Fails

```bash
# Check script permissions
ls -la /opt/trading-bot/scripts/

# Run with debug mode
bash -x /opt/trading-bot/scripts/deploy.sh

# Check environment variables
source /opt/trading-bot/.env
env | grep -E 'POSTGRES|JWT|DATABASE'
```

## Performance Optimization

### 1. Enable Resource Limits

Update docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. Enable Redis Caching

Uncomment Redis service in docker-compose.yml and configure backend to use it.

### 3. Configure Nginx Caching

Add to nginx.conf:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... rest of config
}
```

## Security Checklist

- [ ] SSH key authentication enabled (password auth disabled)
- [ ] Firewall configured (only required ports open)
- [ ] Fail2ban installed and configured
- [ ] SSL/TLS certificates installed
- [ ] Strong passwords in .env file
- [ ] Regular security updates enabled
- [ ] Database not exposed to public internet
- [ ] .env file has proper permissions (600)
- [ ] Regular backups configured
- [ ] Monitoring and alerts set up

## Scaling

### Vertical Scaling (Upgrade Server)

1. Take a backup
2. Upgrade your VPS plan (more CPU/RAM)
3. Restart services

### Horizontal Scaling (Multiple Servers)

For high availability:

1. **Load Balancer**: Use a load balancer (nginx, HAProxy)
2. **Database**: Move PostgreSQL to managed service (AWS RDS, DigitalOcean Managed DB)
3. **Session Storage**: Use Redis for shared sessions
4. **File Storage**: Use object storage (S3, Spaces)

## Cost Estimation

**Monthly costs for different providers:**

| Provider | Plan | Specs | Cost |
|----------|------|-------|------|
| DigitalOcean | Basic Droplet | 2GB RAM, 1 CPU, 50GB SSD | $12/mo |
| Linode | Nanode | 2GB RAM, 1 CPU, 50GB SSD | $12/mo |
| Hetzner | CX21 | 4GB RAM, 2 CPU, 40GB SSD | ~€5/mo |
| AWS EC2 | t3.small | 2GB RAM, 2 CPU | ~$15/mo |
| Vultr | Regular Performance | 2GB RAM, 1 CPU, 55GB SSD | $12/mo |

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Run monitor script: `/opt/trading-bot/monitor.sh`
- Check GitHub Issues
- Review troubleshooting section above

## Next Steps

1. Set up domain name and SSL
2. Configure email notifications
3. Set up monitoring (Prometheus, Grafana)
4. Configure automated backups to cloud storage
5. Set up log aggregation (ELK stack, Loki)
6. Implement health check endpoints
7. Set up alerting (PagerDuty, OpsGenie)
