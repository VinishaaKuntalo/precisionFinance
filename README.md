# Precision Finance

A production-ready personal finance dashboard with real bank account integration via **Plaid**. Track balances, transactions, and credit utilization across all your linked accounts in one place.

---

## Architecture

```
Frontend (React + Vite)  <--->  Backend (Express + SQLite)  <--->  Plaid API
     |                               |
     |                               |
  Auth (JWT)                    Database (file-based)
```

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript + SQLite (better-sqlite3)
- **Bank API**: Plaid (Sandbox → Production)
- **Auth**: JWT + bcrypt

---

## Prerequisites

- Node.js 20+
- npm
- A Plaid account (free for Sandbox, apply for Production)

---

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
# Frontend dependencies
cd app
npm install

# Backend dependencies
cd server
npm install
```

### 2. Configure Environment Variables

**Frontend** (`app/.env`):
```env
VITE_API_URL=http://localhost:3001
```

**Backend** (`server/.env`):
```env
PORT=3001
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

> **Get Plaid credentials**: Sign up at [plaid.com](https://plaid.com), go to the Dashboard → Keys, and copy your Sandbox `client_id` and `secret`.

### 3. Start the Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd app
npm run dev
```

The frontend will be at `http://localhost:3000` and the backend at `http://localhost:3001`.

The Vite dev server is already configured to proxy `/api` requests to the backend.

### 4. First Time Use

1. Open `http://localhost:3000`
2. Click **"Create one"** to register your account
3. Log in
4. Go to the Dashboard and click **"Link New Account"**
5. Use Plaid's Sandbox credentials (e.g., `user_good` / `pass_good` for most banks)
6. Click **"Sync"** to pull transactions

---

## Plaid Production Setup

To link your **real** bank and credit card accounts, you must upgrade from Plaid Sandbox to **Production**.

### Step 1: Apply for Plaid Production

1. Go to your [Plaid Dashboard](https://dashboard.plaid.com/)
2. Navigate to **Keys**
3. Click **"Request Production Access"**
4. Complete the application (business details, use case, expected volume)
5. Plaid will review and approve (usually 1–3 business days)

### Step 2: Update Environment Variables

Once approved, switch to Production keys:

```env
PLAID_CLIENT_ID=your_production_client_id
PLAID_SECRET=your_production_secret_key
PLAID_ENV=production
```

> ⚠️ **Never commit your `.env` file**. It is already in `.gitignore`.

### Step 3: Rebuild & Deploy

```bash
# Build the frontend
cd app
npm run build

# Build the backend (optional, for deployment)
cd server
npm run build
```

---

## Database

SQLite is used for simplicity. The database file is created automatically at:

```
server/data/finance.db
```

### Schema Overview

| Table | Purpose |
|-------|---------|
| `users` | Your account (email, password hash) |
| `plaid_items` | Bank connections (access tokens, institution name) |
| `accounts` | Individual accounts (checking, credit cards, etc.) |
| `transactions` | Transaction history synced from Plaid |

> **Important**: `access_token` values are stored encrypted-at-rest by Plaid, but treat your database as sensitive. Never expose it publicly.

---

## Deployment Options

### Option A: Railway / Render / Fly.io (Recommended)

Deploy the backend to a platform like **Railway** or **Render**:

1. Push your code to GitHub
2. Create a new service on Railway/Render
3. Set the environment variables from `server/.env`
4. Set the build command: `cd server && npm install && npm run build`
5. Set the start command: `cd server && npm start`
6. Note the deployed URL (e.g., `https://precision-finance-api.railway.app`)

Then update your frontend `.env`:
```env
VITE_API_URL=https://precision-finance-api.railway.app
```

Build and deploy the frontend to **Vercel**, **Netlify**, or **GitHub Pages**:
```bash
cd app
npm run build
# Upload the `dist/` folder to your static host
```

### Option B: Single VPS (DigitalOcean, AWS EC2, etc.)

Run both frontend and backend on the same server:

```bash
# Build frontend
cd app && npm run build

# Serve frontend with nginx or any static file server
# Copy dist/ to /var/www/html/

# Run backend
cd server
npm run build
npm start
```

Use nginx to proxy `/api` to the backend:
```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    root /var/www/html;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Log in and receive JWT |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/plaid/link-token` | Create a Plaid Link token |
| POST | `/api/plaid/exchange` | Exchange public token for access token |
| GET | `/api/plaid/accounts` | List all linked accounts |
| GET | `/api/plaid/transactions` | Get recent transactions |
| POST | `/api/plaid/sync` | Sync accounts & transactions from Plaid |

---

## Security Notes

- **Plaid Secret Keys** must only live in the backend `.env` file. Never expose them in the frontend.
- **JWT Secret** should be a long, random string in production.
- **Access Tokens** are stored in the database. In a high-security setup, encrypt them at the application level.
- Use **HTTPS** in production.

---

## Troubleshooting

### "Failed to create link token"
- Check your `PLAID_CLIENT_ID` and `PLAID_SECRET` in `server/.env`
- Ensure `PLAID_ENV` is set to `sandbox` (for testing) or `production` (for live accounts)

### "Cannot open database"
- Ensure the `server/data/` directory exists
- The server creates it automatically on first run

### Frontend can't connect to backend
- Check that `VITE_API_URL` matches the backend URL
- If running locally, ensure both servers are running
- The Vite dev server proxies `/api` to `localhost:3001` automatically

---

## License

Private — for personal use only.
