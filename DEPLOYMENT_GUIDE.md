# Deployment Guide - Trading Bot Platform

Choose your deployment method based on your needs:

## 🚀 Quick Comparison

| Feature | Docker Compose (VPS) | AWS ECS |
|---------|---------------------|---------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐⭐⭐ Complex |
| **Cost** | 💰 $10-20/month | 💰💰💰 $50-200+/month |
| **Scalability** | Limited (vertical) | Excellent (horizontal) |
| **Maintenance** | Manual updates | Automated |
| **Best For** | Small to medium projects | Enterprise applications |
| **Time to Deploy** | 15 minutes | 1-2 hours |

## Deployment Options

### Option 1: Docker Compose on Cloud Server (Recommended for Most Users)

**Perfect for:**
- Personal projects
- Small to medium applications
- Cost-conscious deployments
- Simple infrastructure needs

**Supported providers:**
- DigitalOcean
- Linode
- Hetzner
- Vultr
- AWS EC2
- Any VPS with Ubuntu/Debian

📖 **[Read Full Guide: DEPLOYMENT_DOCKER_COMPOSE.md](./DEPLOYMENT_DOCKER_COMPOSE.md)**

**Quick Start:**
```bash
# 1. Set up server (one-time)
ssh root@your-server-ip
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup-server.sh | sudo bash

# 2. Configure GitHub secrets and push to main
git push origin main

# 3. Done! Your app is deployed automatically
```

---

### Option 2: AWS ECS (Enterprise Grade)

**Perfect for:**
- Enterprise applications
- High traffic applications
- Applications requiring auto-scaling
- Teams with AWS expertise
- Compliance requirements

**AWS Services used:**
- ECS Fargate (container orchestration)
- ECR (container registry)
- RDS (managed PostgreSQL)
- Application Load Balancer
- CloudWatch (logging & monitoring)

📖 **[Read Full Guide: DEPLOYMENT.md](./DEPLOYMENT.md)**

**Quick Start:**
```bash
# 1. Set up AWS infrastructure (see DEPLOYMENT.md)
# 2. Configure GitHub secrets with AWS credentials
# 3. Push to main branch
git push origin main
```

---

## Local Development

Both deployment methods use the same local development setup:

```bash
# Clone repository
git clone <your-repo-url>
cd bot

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access your application:**
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

---

## CI/CD Workflow

### Docker Compose Deployment

File: `.github/workflows/deploy-docker-compose.yml`

**Triggers:**
- Push to `main` (staging)
- Push to `production`
- Manual trigger

**Steps:**
1. Run tests (backend + frontend)
2. Build Docker images
3. Push to GitHub Container Registry
4. SSH to server
5. Deploy with docker-compose
6. Run database migrations
7. Health checks

**Required GitHub Secrets:**
- `SSH_PRIVATE_KEY`
- `STAGING_SERVER_HOST`
- `STAGING_SERVER_USER`
- `PRODUCTION_SERVER_HOST`
- `PRODUCTION_SERVER_USER`

### AWS ECS Deployment

File: `.github/workflows/deploy-to-ecs.yml`

**Triggers:**
- Push to `main` (staging)
- Push to `production`
- Manual trigger

**Steps:**
1. Run tests (backend + frontend)
2. Build Docker images
3. Push to AWS ECR
4. Update ECS task definitions
5. Deploy to ECS services
6. Run database migrations
7. Wait for service stability

**Required GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## Migration Between Deployment Methods

### From Docker Compose to AWS ECS

1. **Backup your data:**
   ```bash
   docker-compose exec postgres pg_dump -U postgres trading_bot > backup.sql
   ```

2. **Set up AWS infrastructure** (follow DEPLOYMENT.md)

3. **Restore database** to RDS

4. **Switch workflow:**
   - Disable docker-compose workflow
   - Enable ECS workflow
   - Update GitHub secrets

### From AWS ECS to Docker Compose

1. **Export RDS database:**
   ```bash
   pg_dump -h your-rds-endpoint -U postgres trading_bot > backup.sql
   ```

2. **Set up VPS server** (follow DEPLOYMENT_DOCKER_COMPOSE.md)

3. **Restore database:**
   ```bash
   docker-compose exec -T postgres psql -U postgres trading_bot < backup.sql
   ```

4. **Switch workflow:**
   - Disable ECS workflow
   - Enable docker-compose workflow
   - Update GitHub secrets

---

## Feature Comparison Matrix

| Feature | Docker Compose | AWS ECS |
|---------|---------------|---------|
| **Deployment** |
| Auto-deployment on push | ✅ | ✅ |
| Rollback capability | Manual | Automatic |
| Blue-green deployment | ❌ | ✅ |
| Zero-downtime deployment | Limited | ✅ |
| **Scaling** |
| Horizontal scaling | ❌ | ✅ |
| Vertical scaling | Manual (resize VPS) | ✅ |
| Auto-scaling | ❌ | ✅ |
| Load balancing | Manual (nginx) | ✅ (ALB) |
| **Database** |
| Database type | PostgreSQL (Docker) | RDS PostgreSQL |
| Automated backups | Manual scripts | ✅ |
| Point-in-time recovery | ❌ | ✅ |
| Multi-AZ | ❌ | ✅ |
| **Monitoring** |
| Basic logging | ✅ | ✅ |
| Centralized logging | Manual setup | ✅ (CloudWatch) |
| Metrics & dashboards | Manual setup | ✅ (CloudWatch) |
| Alerting | Manual setup | ✅ |
| **Security** |
| SSL/TLS | Manual (Let's Encrypt) | ✅ (ACM) |
| Secrets management | .env file | ✅ (Secrets Manager) |
| Network isolation | Docker network | ✅ (VPC) |
| DDoS protection | Manual | ✅ (AWS Shield) |
| **Cost** |
| Monthly (small) | ~$12 | ~$50 |
| Monthly (medium) | ~$24 | ~$100 |
| Monthly (large) | ~$48 | ~$200+ |
| Free tier | Some providers | ✅ (12 months) |

---

## Recommended Setup by Use Case

### Personal Project / MVP
```
✅ Docker Compose on Hetzner/DigitalOcean
💰 Cost: ~$5-12/month
⚡ Setup: 15 minutes
```

### Small Business / Startup
```
✅ Docker Compose on Linode/DigitalOcean
💰 Cost: ~$12-24/month
⚡ Setup: 30 minutes
```

### Growing Application
```
✅ Docker Compose with monitoring
💰 Cost: ~$24-48/month
⚡ Setup: 1 hour
Consider: Load balancer if traffic grows
```

### Enterprise / High Traffic
```
✅ AWS ECS with RDS
💰 Cost: $100-500+/month
⚡ Setup: 2-4 hours
Includes: Auto-scaling, monitoring, backups
```

---

## Support & Resources

### Documentation
- [Docker Compose Deployment](./DEPLOYMENT_DOCKER_COMPOSE.md)
- [AWS ECS Deployment](./DEPLOYMENT.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)

### Troubleshooting
- Check service logs: `docker-compose logs -f`
- Monitor resources: `docker stats`
- Health checks: `curl localhost:3000/api/health`

### Community
- GitHub Issues
- GitHub Discussions

---

## Security Checklist

Both deployment methods:
- [ ] Strong passwords in environment variables
- [ ] SSH key authentication (disable password auth)
- [ ] Firewall configured
- [ ] SSL/TLS certificates installed
- [ ] Regular backups configured
- [ ] Secrets not committed to Git
- [ ] Database not exposed to public
- [ ] Regular security updates

---

## Next Steps

1. **Choose your deployment method** based on your needs
2. **Follow the appropriate guide** (linked above)
3. **Set up monitoring** and alerts
4. **Configure backups**
5. **Set up custom domain** and SSL
6. **Review security checklist**

Need help? Open an issue or check the documentation!
