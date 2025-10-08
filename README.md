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

### Backend
1. Set up PostgreSQL database
2. Configure production environment variables
3. Deploy to your preferred platform (Vercel, Railway, etc.)

### Frontend
1. Update production environment configuration
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Netlify, Vercel, etc.)

## License

MIT