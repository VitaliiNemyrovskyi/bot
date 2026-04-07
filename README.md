# Authentication App with Next.js & Angular

A full-stack authentication application with JWT-based authentication, Google OAuth integration, and role-based access control with subscription tiers.

## Project Structure

```
bot/
├── backend/          # Next.js API backend
│   ├── src/
│   │   ├── app/api/  # API routes
│   │   ├── lib/      # Utility functions
│   │   └── middleware/
│   ├── prisma/       # Database schema
│   └── .env.*        # Environment configs
├── frontend/         # Angular frontend
│   ├── src/
│   │   ├── app/      # Angular components
│   │   └── environments/
└── README.md
```

## Features

- 🔐 JWT-based authentication
- 🌐 Google OAuth integration
- 👥 Role-based access control (BASIC, PREMIUM, ENTERPRISE, ADMIN)
- 💳 Subscription management
- 🎨 Responsive Angular UI
- 📱 Environment-based configuration
- 🗄️ PostgreSQL database with Prisma ORM

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Google OAuth credentials

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local .env
   # Edit .env with your actual values
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update environment configuration in `src/environments/`

4. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Subscriptions
- `GET /api/subscriptions` - Get available plans
- `POST /api/subscriptions` - Subscribe to a plan

## Environment Variables

### Backend (.env.local, .env.staging, .env.production)
```
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:4200
```

### Frontend (environments/*.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: 'your-google-client-id'
};
```

## Role Hierarchy

1. **BASIC** (Free) - Basic features, limited access
2. **PREMIUM** ($9.99/month) - Advanced features, unlimited API calls
3. **ENTERPRISE** ($29.99/month) - Full features, team management
4. **ADMIN** - System administration access

## Database Schema

The application uses Prisma with PostgreSQL. Key models:
- `User` - User accounts with roles and subscription info
- `Session` - JWT session management
- `Subscription` - Available subscription plans

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Session management
- Role-based route protection
- Google OAuth verification
- CORS configuration
- Rate limiting (production)

## Deployment

This application supports multiple deployment methods. Choose the one that fits your needs:

### 🚀 Docker Compose on Cloud Server (Recommended)
**Cost:** ~$10-20/month | **Setup:** 15 minutes

Perfect for small to medium applications. Deploy to any VPS (DigitalOcean, Linode, Hetzner, etc.)

```bash
# One-time server setup
ssh root@your-server-ip
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup-server.sh | sudo bash

# Configure GitHub Actions and push
git push origin main
```

📖 **[Full Docker Compose Deployment Guide](./DEPLOYMENT_DOCKER_COMPOSE.md)**

### ☁️ AWS ECS (Enterprise)
**Cost:** ~$50-200+/month | **Setup:** 1-2 hours

Enterprise-grade deployment with auto-scaling, managed database, and full AWS integration.

📖 **[Full AWS ECS Deployment Guide](./DEPLOYMENT.md)**

### 📘 Deployment Overview
For a complete comparison and recommendations, see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## Local Development with Docker

```bash
# Start all services (backend, frontend, database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access the application:
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Database: localhost:5432

## License

MIT