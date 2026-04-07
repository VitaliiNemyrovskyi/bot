# Deployment Guide

This guide covers deploying the Trading Bot Platform to AWS ECS using Docker containers and GitHub Actions CI/CD.

## Table of Contents

1. [Local Development with Docker](#local-development-with-docker)
2. [AWS Infrastructure Setup](#aws-infrastructure-setup)
3. [GitHub Actions Configuration](#github-actions-configuration)
4. [Deployment Process](#deployment-process)
5. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)

## Local Development with Docker

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 21.7.3 (npm 10.5.0) for local development

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bot
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432

5. **View logs:**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

6. **Stop services:**
   ```bash
   docker-compose down
   ```

### Building Individual Services

**Backend only:**
```bash
cd backend
docker build -t trading-bot-backend .
docker run -p 3000:3000 --env-file .env trading-bot-backend
```

**Frontend only:**
```bash
cd frontend
docker build -t trading-bot-frontend .
docker run -p 80:80 trading-bot-frontend
```

## AWS Infrastructure Setup

### 1. Create ECR Repositories

```bash
# Set your AWS region
export AWS_REGION=us-east-1

# Create ECR repositories for backend and frontend
aws ecr create-repository \
  --repository-name trading-bot-backend \
  --region $AWS_REGION

aws ecr create-repository \
  --repository-name trading-bot-frontend \
  --region $AWS_REGION
```

### 2. Create RDS PostgreSQL Database

```bash
# Create DB subnet group (replace with your subnet IDs)
aws rds create-db-subnet-group \
  --db-subnet-group-name trading-bot-subnet-group \
  --db-subnet-group-description "Subnet group for trading bot" \
  --subnet-ids subnet-12345678 subnet-87654321 \
  --region $AWS_REGION

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier trading-bot-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username postgres \
  --master-user-password "YourSecurePassword123!" \
  --allocated-storage 20 \
  --db-subnet-group-name trading-bot-subnet-group \
  --vpc-security-group-ids sg-12345678 \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --region $AWS_REGION
```

### 3. Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name trading-bot-cluster \
  --region $AWS_REGION
```

### 4. Create Task Execution Role

```bash
# Create IAM role for ECS task execution
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

# Attach required policies
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

**trust-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### 5. Create Task Definitions

**Backend Task Definition** (`backend-task-definition.json`):
```json
{
  "family": "trading-bot-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trading-bot-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:trading-bot/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:trading-bot/jwt-secret"
        },
        {
          "name": "GOOGLE_CLIENT_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:trading-bot/google-client-id"
        },
        {
          "name": "GOOGLE_CLIENT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:trading-bot/google-client-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/trading-bot-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**Frontend Task Definition** (`frontend-task-definition.json`):
```json
{
  "family": "trading-bot-frontend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trading-bot-frontend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/trading-bot-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:80/health || exit 1"],
        "interval": 30,
        "timeout": 3,
        "retries": 3,
        "startPeriod": 10
      }
    }
  ]
}
```

Register task definitions:
```bash
aws ecs register-task-definition \
  --cli-input-json file://backend-task-definition.json \
  --region $AWS_REGION

aws ecs register-task-definition \
  --cli-input-json file://frontend-task-definition.json \
  --region $AWS_REGION
```

### 6. Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name trading-bot-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678 \
  --region $AWS_REGION

# Create target groups
aws elbv2 create-target-group \
  --name trading-bot-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /api/health \
  --region $AWS_REGION

aws elbv2 create-target-group \
  --name trading-bot-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /health \
  --region $AWS_REGION

# Create listeners (replace ARNs with your values)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:loadbalancer/app/trading-bot-alb/... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/trading-bot-frontend-tg/...
```

### 7. Create ECS Services

```bash
# Backend service
aws ecs create-service \
  --cluster trading-bot-cluster \
  --service-name trading-bot-backend-service \
  --task-definition trading-bot-backend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/trading-bot-backend-tg/...,containerName=backend,containerPort=3000" \
  --region $AWS_REGION

# Frontend service
aws ecs create-service \
  --cluster trading-bot-cluster \
  --service-name trading-bot-frontend-service \
  --task-definition trading-bot-frontend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/trading-bot-frontend-tg/...,containerName=frontend,containerPort=80" \
  --region $AWS_REGION
```

### 8. Configure AWS Secrets Manager

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name trading-bot/database-url \
  --secret-string "postgresql://postgres:password@your-rds-endpoint:5432/trading_bot" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name trading-bot/jwt-secret \
  --secret-string "your-super-secret-jwt-key" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name trading-bot/google-client-id \
  --secret-string "your-google-client-id" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name trading-bot/google-client-secret \
  --secret-string "your-google-client-secret" \
  --region $AWS_REGION
```

## GitHub Actions Configuration

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

### 2. Update Workflow Variables

Edit `.github/workflows/deploy-to-ecs.yml` and update these values:

```yaml
env:
  AWS_REGION: us-east-1 # Your AWS region
  ECR_BACKEND_REPOSITORY: trading-bot-backend
  ECR_FRONTEND_REPOSITORY: trading-bot-frontend
  ECS_CLUSTER: trading-bot-cluster
  ECS_SERVICE_BACKEND: trading-bot-backend-service
  ECS_SERVICE_FRONTEND: trading-bot-frontend-service
```

### 3. Trigger Deployment

The GitHub Actions workflow will automatically trigger on:
- Push to `main`, `staging`, or `production` branches
- Manual workflow dispatch

```bash
# Push changes to trigger deployment
git add .
git commit -m "feat: add new feature"
git push origin main
```

## Deployment Process

### Automated Deployment Flow

1. **Code Push**: Developer pushes code to main branch
2. **Tests**: GitHub Actions runs backend and frontend tests
3. **Build**: Docker images are built for backend and frontend
4. **Push to ECR**: Images are pushed to AWS ECR
5. **Deploy Backend**: ECS updates backend service with new image
6. **Run Migrations**: Prisma migrations are executed
7. **Deploy Frontend**: ECS updates frontend service with new image
8. **Verify**: Health checks ensure services are running

### Manual Deployment

If you need to deploy manually:

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t trading-bot-backend .
docker tag trading-bot-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trading-bot-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trading-bot-backend:latest

# Build and push frontend
cd ../frontend
docker build -t trading-bot-frontend .
docker tag trading-bot-frontend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trading-bot-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trading-bot-frontend:latest

# Update ECS services
aws ecs update-service \
  --cluster trading-bot-cluster \
  --service trading-bot-backend-service \
  --force-new-deployment \
  --region us-east-1

aws ecs update-service \
  --cluster trading-bot-cluster \
  --service trading-bot-frontend-service \
  --force-new-deployment \
  --region us-east-1
```

### Running Database Migrations

```bash
# Get the task ID of a running backend container
TASK_ID=$(aws ecs list-tasks \
  --cluster trading-bot-cluster \
  --service-name trading-bot-backend-service \
  --desired-status RUNNING \
  --query 'taskArns[0]' \
  --output text)

# Execute migration command
aws ecs execute-command \
  --cluster trading-bot-cluster \
  --task $TASK_ID \
  --container backend \
  --interactive \
  --command "npx prisma migrate deploy"
```

## Monitoring and Troubleshooting

### CloudWatch Logs

View logs for your services:

```bash
# Backend logs
aws logs tail /ecs/trading-bot-backend --follow

# Frontend logs
aws logs tail /ecs/trading-bot-frontend --follow
```

### ECS Service Status

Check service health:

```bash
aws ecs describe-services \
  --cluster trading-bot-cluster \
  --services trading-bot-backend-service trading-bot-frontend-service
```

### Common Issues

1. **Task fails to start:**
   - Check CloudWatch logs for errors
   - Verify environment variables and secrets
   - Ensure security groups allow traffic

2. **Database connection errors:**
   - Verify DATABASE_URL secret is correct
   - Check RDS security group allows connections from ECS
   - Ensure RDS is in the same VPC as ECS

3. **502 Bad Gateway:**
   - Check target group health checks
   - Verify backend is listening on correct port
   - Check security group rules

4. **Image pull errors:**
   - Verify ECR repository exists
   - Check task execution role has ECR permissions
   - Ensure image tag exists in ECR

### Scaling

```bash
# Scale backend service
aws ecs update-service \
  --cluster trading-bot-cluster \
  --service trading-bot-backend-service \
  --desired-count 3

# Enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/trading-bot-cluster/trading-bot-backend-service \
  --min-capacity 1 \
  --max-capacity 10
```

## Cost Optimization

1. **Use Fargate Spot**: For non-critical workloads
2. **Right-size tasks**: Start with smaller CPU/memory and scale up
3. **Use RDS reserved instances**: For production databases
4. **Enable ECS Exec only when needed**: Disable after troubleshooting
5. **Set up CloudWatch alarms**: Monitor and optimize resource usage

## Security Best Practices

1. **Use AWS Secrets Manager**: Never hardcode secrets
2. **Enable VPC Flow Logs**: Monitor network traffic
3. **Use IAM roles**: Grant least privilege access
4. **Enable ECS Container Insights**: Monitor security metrics
5. **Regular security updates**: Keep base images updated
6. **Use HTTPS**: Configure SSL/TLS on ALB
7. **Enable WAF**: Protect against common web attacks

## Backup and Disaster Recovery

1. **Database backups**: RDS automated backups enabled
2. **ECR image retention**: Keep last 30 images
3. **Infrastructure as Code**: Store all configs in Git
4. **Multi-region deployment**: For high availability

## Next Steps

1. Set up CloudFront for CDN
2. Configure Route 53 for custom domain
3. Implement SSL/TLS certificates
4. Set up monitoring and alerting
5. Configure auto-scaling policies
6. Implement blue-green deployment

## Support

For issues or questions:
- Check CloudWatch logs
- Review ECS service events
- Check GitHub Actions workflow logs
- Contact the DevOps team
