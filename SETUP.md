# Trading Bot Platform - Setup Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Common Setup Issues](#common-setup-issues)
- [Development Tools](#development-tools)
- [Next Steps](#next-steps)

---

## Prerequisites

Before setting up the Trading Bot Platform, ensure you have the following installed:

### Required Software

- **Node.js**: v20.0.0 or higher (v21.7.3 confirmed working)
- **npm**: v10.0.0 or higher (v10.5.0 confirmed working)
- **Git**: Latest version

### Check Your Versions

```bash
node --version   # Should be v20+
npm --version    # Should be v10+
git --version    # Any recent version
```

### Optional Tools

- **VS Code** or your preferred IDE
- **Angular CLI**: Will be installed as dev dependency
- **Chrome/Firefox DevTools**: For debugging

---

## Quick Start

Get up and running in 5 minutes:

```bash
# Clone the repository
git clone <repository-url>
cd bot

# Install and start backend
cd backend
npm install
npm run dev

# In a new terminal, install and start frontend
cd frontend
npm install
npm start

# Open http://localhost:4200 in your browser
```

The frontend will run on `http://localhost:4200` and proxy API requests to the backend at `http://localhost:3000`.

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Angular 18.0.0
- RxJS 7.8.0
- lightweight-charts 5.0.8
- TypeScript 5.4.5
- And all other dependencies

**Installation Time**: Approximately 2-5 minutes depending on your internet connection

### 3. Verify Installation

```bash
# Check Angular CLI is available
npx ng version

# Should show Angular CLI version 18.0.0
```

### 4. Development Server

```bash
npm start
# or
npm run start
# or
npx ng serve --proxy-config proxy.conf.js
```

**Output**:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Browser application bundle generation complete.
Initial Chunk Files   | Names         |  Raw Size
polyfills.js         | polyfills     |  90.20 kB |
main.js              | main          |  22.15 kB |
styles.css           | styles        |   5.10 kB |

✔ Compiled successfully.
```

Open your browser and navigate to: `http://localhost:4200`

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 15.5.2
- React 19.1.0
- bybit-api 4.3.1
- jsonwebtoken 9.0.2
- bcryptjs 2.4.3
- And all other dependencies

### 3. Create Environment File

```bash
cp .env.example .env
# or create manually
touch .env
```

Edit `.env` with your configuration (see [Environment Configuration](#environment-configuration) below).

### 4. Development Server

```bash
npm run dev
```

**Output**:
```
  ▲ Next.js 15.5.2
  - Local:        http://localhost:3000

 ✓ Ready in 1.5s
```

The backend API will be available at: `http://localhost:3000`

---

## Environment Configuration

### Frontend Configuration

#### proxy.conf.js

The frontend uses a proxy configuration to forward API requests to the backend.

**Location**: `/frontend/proxy.conf.js`

```javascript
module.exports = {
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
};
```

**What this does**:
- All requests to `/api/*` are forwarded to `http://localhost:3000/api/*`
- Solves CORS issues during development
- No changes needed for most use cases

#### Angular Environment Files

**Location**: `/frontend/src/environments/`

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: '/api'  // Will be proxied to localhost:3000
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

### Backend Configuration

#### .env File

**Location**: `/backend/.env`

Create this file with the following variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Bybit API (Optional for some features)
BYBIT_API_KEY=your-bybit-api-key
BYBIT_API_SECRET=your-bybit-api-secret

# Database (If implementing persistence)
DATABASE_URL=postgresql://user:password@localhost:5432/tradingbot

# Application
NODE_ENV=development
PORT=3000
```

#### Required vs Optional Variables

**Required**:
- `JWT_SECRET` - Used for authentication tokens

**Optional**:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Only needed for Google OAuth login
- `BYBIT_API_KEY`, `BYBIT_API_SECRET` - Only needed for authenticated trading operations
- `DATABASE_URL` - Only needed if implementing database persistence

#### Generating JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

---

## Running the Application

### Development Mode

#### Option 1: Two Terminal Approach (Recommended)

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

#### Option 2: Single Command (Using npm scripts)

Create a script in the root package.json (if available) or use a process manager like `concurrently`:

```bash
# Install concurrently globally
npm install -g concurrently

# Run both servers
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

### Accessing the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health (if implemented)

### Verifying Everything Works

1. Open http://localhost:4200
2. You should see the Trading Bot Platform home page
3. Check the browser console - no errors should appear
4. Try navigating to the chart page
5. The chart should load with real-time data from Bybit

---

## Building for Production

### Frontend Production Build

```bash
cd frontend
npm run build
```

**Output**: `dist/frontend/` directory containing static files

**Configuration**:
- Optimized bundles with tree-shaking
- AOT (Ahead of Time) compilation
- CSS minification
- Production environment configuration

**Deployment**:
```bash
# Serve the built files with any static file server
npx http-server dist/frontend -p 8080

# Or copy to your web server
scp -r dist/frontend/* user@server:/var/www/html/
```

### Backend Production Build

```bash
cd backend
npm run build
```

This creates an optimized production build using Next.js.

**Start Production Server**:
```bash
npm start
```

**Deployment Options**:
- Vercel (recommended for Next.js)
- Docker container
- Traditional Node.js hosting (PM2)

### Docker Deployment (Optional)

Create `Dockerfile` for each service:

**Frontend Dockerfile**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npx", "http-server", "dist/frontend", "-p", "80"]
```

**Backend Dockerfile**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Common Setup Issues

### Issue 1: Port Already in Use

**Error**:
```
Error: listen EADDRINUSE: address already in use :::4200
```

**Solution**:
```bash
# Find process using the port
lsof -i :4200  # macOS/Linux
netstat -ano | findstr :4200  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
ng serve --port 4201
```

### Issue 2: npm install Fails

**Error**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, use legacy peer deps
npm install --legacy-peer-deps
```

### Issue 3: TypeScript Errors

**Error**:
```
error TS2307: Cannot find module 'lightweight-charts'
```

**Solution**:
```bash
# Ensure all dependencies are installed
npm install

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Issue 4: Proxy Not Working

**Symptom**: API calls return 404 or CORS errors

**Solution**:
1. Ensure backend is running on port 3000
2. Check `proxy.conf.js` configuration
3. Restart Angular dev server
4. Check browser console for actual error

### Issue 5: WebSocket Connection Fails

**Symptom**: Chart doesn't update, "WebSocket failed to connect" in console

**Solution**:
- Check internet connection (WebSocket connects to Bybit directly)
- Verify no firewall blocking wss://stream.bybit.com
- Check browser console for specific error messages
- Bybit API status: https://bybit-exchange.github.io/docs/v5/intro

### Issue 6: Build Fails with Memory Error

**Error**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Then run build
npm run build
```

---

## Development Tools

### Recommended VS Code Extensions

- **Angular Language Service** - Angular template IntelliSense
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Angular Snippets** - Useful Angular code snippets
- **GitLens** - Enhanced Git capabilities

### Chrome DevTools Extensions

- **Angular DevTools** - Debug Angular applications
- **Redux DevTools** - If using NgRx (future enhancement)

### Testing the Application

#### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run e2e

# Code coverage
npm test -- --code-coverage
```

#### Backend Tests

```bash
cd backend

# Run tests (if configured)
npm test
```

### Linting

```bash
# Frontend linting
cd frontend
npm run lint

# Backend linting
cd backend
npm run lint
```

---

## Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/       # UI components
│   │   │   ├── lightweight-chart/
│   │   │   ├── trading/
│   │   │   └── ui/
│   │   ├── services/         # Business logic services
│   │   │   ├── bybit.service.ts
│   │   │   ├── bybit-websocket.service.ts
│   │   │   └── ...
│   │   ├── guards/           # Route guards
│   │   ├── interceptors/     # HTTP interceptors
│   │   └── app.routes.ts     # Routing configuration
│   ├── environments/         # Environment configs
│   └── assets/              # Static assets
├── proxy.conf.js            # Development proxy
└── package.json
```

### Backend Structure

```
backend/
├── src/
│   └── app/
│       ├── api/              # API routes
│       │   ├── auth/
│       │   ├── trading/
│       │   └── user/
│       ├── lib/              # Utility libraries
│       ├── middleware/       # Custom middleware
│       └── types/            # TypeScript types
├── .env                      # Environment variables
└── package.json
```

---

## Next Steps

After successfully setting up the application:

1. **Explore the Documentation**:
   - Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
   - Review [WEBSOCKET_DATA_FLOW.md](./WEBSOCKET_DATA_FLOW.md) for real-time data flow
   - Check [API_REFERENCE.md](./API_REFERENCE.md) for API documentation

2. **Try Key Features**:
   - View real-time charts at `/chart`
   - Configure a grid bot at `/trading/bot-config`
   - Test WebSocket connection at `/websocket-test`

3. **Configure for Your Needs**:
   - Add your trading exchange API keys (if needed)
   - Customize default symbols and intervals
   - Adjust theme and preferences

4. **Start Development**:
   - Create custom trading strategies
   - Add new chart indicators
   - Implement additional exchange integrations

---

## Troubleshooting Resources

### Getting Help

- **Check Console Logs**: Most issues show detailed error messages
- **GitHub Issues**: Search existing issues or create new one
- **Documentation**: Refer to ARCHITECTURE.md and API_REFERENCE.md

### Useful Commands

```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Reset Git repository (careful!)
git clean -fdx
git reset --hard HEAD

# Check for outdated packages
npm outdated

# Update packages (carefully!)
npm update
```

### Log Files

Check these locations for detailed logs:
- Browser Console: F12 → Console tab
- Backend logs: Terminal where `npm run dev` is running
- Network tab: F12 → Network tab for API call details

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production API URL in frontend environment
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure database (if needed)
- [ ] Set up automated backups
- [ ] Configure logging
- [ ] Test all critical paths
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and DNS
- [ ] Set up SSL certificates

---

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bybit API Documentation](https://bybit-exchange.github.io/docs/v5/intro)
- [lightweight-charts Documentation](https://tradingview.github.io/lightweight-charts/)
- [RxJS Documentation](https://rxjs.dev/)

---

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section above

Happy Trading!
