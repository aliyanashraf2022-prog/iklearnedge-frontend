# Complete Connection Guide - Frontend + Backend + Database

## 📚 Table of Contents
1. [Architecture Overview](#architecture)
2. [Local Development Setup](#local-setup)
3. [Online Deployment Guide](#online-deployment)
4. [Connecting Frontend to Backend](#connecting)
5. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview <a name="architecture"></a>

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │  Landing    │  │  Dashboards  │  │  Auth Forms      │       │
│  │  Pages      │  │  (3 panels)  │  │  (Login/Reg)     │       │
│  └─────────────┘  └──────────────┘  └──────────────────┘       │
│                                                                 │
│  Hosted on: Vercel (Free) or Netlify (Free)                    │
│  URL: https://your-app.vercel.app                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ API Calls (HTTP/JSON)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │  Auth API   │  │  Teachers    │  │  Bookings        │       │
│  │  (/auth)    │  │  (/teachers) │  │  (/bookings)     │       │
│  └─────────────┘  └──────────────┘  └──────────────────┘       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │  Subjects   │  │  Payments    │  │  Admin           │       │
│  │  (/subjects)│  │  (/payments) │  │  (/admin)        │       │
│  └─────────────┘  └──────────────┘  └──────────────────┘       │
│                                                                 │
│  Hosted on: Railway (Free) or Render (Free)                    │
│  URL: https://your-api.railway.app/api                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │  Users      │  │  Teachers    │  │  Bookings        │       │
│  │  Table      │  │  Table       │  │  Table           │       │
│  └─────────────┘  └──────────────┘  └──────────────────┘       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │  Subjects   │  │  Payments    │  │  Documents       │       │
│  │  Table      │  │  Table       │  │  Table           │       │
│  └─────────────┘  └──────────────┘  └──────────────────┘       │
│                                                                 │
│  Hosted on: Supabase (Free Tier)                               │
│  URL: postgresql://...supabase.co:5432/postgres               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Local Development Setup <a name="local-setup"></a>

### Step 1: Install Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (Database)
   - Download: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

3. **Git** (Version control)
   - Download: https://git-scm.com/

### Step 2: Setup Database Locally

```bash
# 1. Open PostgreSQL command line (psql)
psql -U postgres

# 2. Create database
CREATE DATABASE iklearnedge;

# 3. Connect to database
\c iklearnedge

# 4. Run the schema file (in another terminal)
psql -U postgres -d iklearnedge -f backend/database/migrations/001_initial_schema.sql
```

### Step 3: Setup Backend

```bash
# 1. Navigate to backend folder
cd /mnt/okcomputer/output/backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env file with your settings
# Use any text editor to open and edit .env
```

**Your `.env` file should look like this for local development:**
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@localhost:5432/iklearnedge
JWT_SECRET=your-secret-key-here-minimum-32-characters-long
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

```bash
# 5. Start the backend server
npm run dev

# You should see:
# ✅ Database connected successfully
# 🚀 Server running on port 5000
# 📍 Environment: development
# 🔗 API URL: http://localhost:5000/api
```

### Step 4: Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","timestamp":"2024-...","environment":"development"}
```

### Step 5: Setup Frontend

```bash
# 1. Navigate to frontend folder
cd /mnt/okcomputer/output/app

# 2. Install dependencies (if not already done)
npm install

# 3. Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# 4. Start the frontend development server
npm run dev

# You should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### Step 6: Verify Everything Works

1. Open browser: http://localhost:5173
2. You should see the landing page
3. Try logging in (use any email - mock auth is still active)
4. Check browser console for API calls

---

## 🌐 Online Deployment Guide <a name="online-deployment"></a>

### FREE Deployment Stack

| Component | Service | Cost | Why? |
|-----------|---------|------|------|
| Frontend | Vercel | $0 | Best for React, auto-deploy |
| Backend | Railway | $0 | $5 credit/month, easy setup |
| Database | Supabase | $0 | 500MB, generous free tier |
| File Storage | Cloudinary | $0 | 25GB storage |

---

### PART 1: Deploy Database (Supabase)

#### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Create new organization

#### Step 2: Create New Project
1. Click "New Project"
2. Name: `iklearnedge`
3. Database Password: (save this!)
4. Region: Choose closest to your users (e.g., `Singapore` for Asia)
5. Click "Create New Project"

#### Step 3: Get Database Connection String
1. Wait for project to be created (2-3 minutes)
2. Go to Project Settings (gear icon) → Database
3. Find "Connection string" section
4. Copy the URI:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Save this - you'll need it for backend!

#### Step 4: Run Migrations
**Option A: Using Supabase SQL Editor (EASIEST)**
1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy contents from `backend/database/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click "Run"

**Option B: Using psql**
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f backend/database/migrations/001_initial_schema.sql
```

---

### PART 2: Deploy Backend (Railway)

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Verify email

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. If repo not visible, configure GitHub permissions
4. Or use "Empty Project" and deploy manually

#### Step 3: Add PostgreSQL (Optional - can use Supabase)
1. Click "New" → Database → Add PostgreSQL
2. Or skip if using Supabase directly

#### Step 4: Deploy Backend

**Option A: Deploy from GitHub**
1. Push your backend code to GitHub
2. In Railway: New → GitHub Repo
3. Select your repository
4. Railway auto-detects Node.js

**Option B: Deploy manually with CLI**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate to backend
cd /mnt/okcomputer/output/backend

# 4. Initialize project
railway init

# 5. Deploy
railway up
```

#### Step 5: Set Environment Variables
1. In Railway dashboard, click on your service
2. Go to "Variables" tab
3. Add each variable:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-key-here-minimum-32-characters
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Step 6: Get Backend URL
1. In Railway dashboard, your service will have a URL
2. It looks like: `https://iklearnedge-production.up.railway.app`
3. Save this - you'll need it for frontend!

---

### PART 3: Deploy Frontend (Vercel)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Verify email

#### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 3: Update Frontend API URL
Edit `/mnt/okcomputer/output/app/src/data/apiConfig.ts` (create this file):

```typescript
// src/data/apiConfig.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

Or update directly in the code where API calls are made.

#### Step 4: Create vercel.json
Create `/mnt/okcomputer/output/app/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Step 5: Deploy
```bash
# 1. Navigate to frontend
cd /mnt/okcomputer/output/app

# 2. Deploy
vercel

# 3. Follow prompts:
# - Set up and deploy? [Y/n] → Y
# - Link to existing project? [y/N] → N
# - What's your project name? → iklearnedge

# 4. For production:
vercel --prod
```

#### Step 6: Set Environment Variables
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

#### Step 7: Redeploy
```bash
vercel --prod
```

---

## 🔌 Connecting Frontend to Backend <a name="connecting"></a>

### Understanding the Connection Flow

```
Frontend (React)          Backend (Express)         Database (PostgreSQL)
     │                           │                           │
     │  1. User clicks button    │                           │
     │──────────────────────────>│                           │
     │                           │                           │
     │  2. API call with JWT     │                           │
     │  GET /api/teachers        │                           │
     │  Authorization: Bearer... │                           │
     │──────────────────────────>│                           │
     │                           │                           │
     │                           │  3. Verify JWT token      │
     │                           │  (auth middleware)        │
     │                           │                           │
     │                           │  4. Query database        │
     │                           │  SELECT * FROM teachers   │
     │                           │──────────────────────────>│
     │                           │                           │
     │                           │  5. Return results        │
     │                           │<──────────────────────────│
     │                           │                           │
     │  6. Return JSON response  │                           │
     │  { teachers: [...] }      │                           │
     │<──────────────────────────│                           │
     │                           │                           │
     │  7. Update UI with data   │                           │
     │  (React state update)     │                           │
```

### Step-by-Step Implementation

#### Step 1: Create API Service File

Create `/mnt/okcomputer/output/app/src/services/api.ts`:

```typescript
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (userData: any) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getMe: () =>
    apiCall('/auth/me'),
};

// Subjects API
export const subjectsAPI = {
  getAll: () =>
    apiCall('/subjects'),
  
  getById: (id: string) =>
    apiCall(`/subjects/${id}`),
  
  getPrice: (id: string, gradeLevel: string) =>
    apiCall(`/subjects/${id}/price?gradeLevel=${encodeURIComponent(gradeLevel)}`),
};

// Teachers API
export const teachersAPI = {
  getAll: (filters?: { subject?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.search) params.append('search', filters.search);
    return apiCall(`/teachers?${params.toString()}`);
  },
  
  getById: (id: string) =>
    apiCall(`/teachers/${id}`),
  
  getProfile: () =>
    apiCall('/teachers/profile'),
  
  updateProfile: (data: any) =>
    apiCall('/teachers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Bookings API
export const bookingsAPI = {
  getAll: () =>
    apiCall('/bookings'),
  
  getById: (id: string) =>
    apiCall(`/bookings/${id}`),
  
  create: (data: any) =>
    apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: string) =>
    apiCall(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Payments API
export const paymentsAPI = {
  uploadProof: (data: any) =>
    apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Admin API
export const adminAPI = {
  getStats: () =>
    apiCall('/admin/stats'),
  
  getAllUsers: () =>
    apiCall('/admin/users'),
  
  verifyTeacher: (id: string, status: string, notes?: string) =>
    apiCall(`/teachers/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  
  verifyPayment: (id: string, status: string, notes?: string) =>
    apiCall(`/payments/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
};
```

#### Step 2: Update Auth Context to Use Real API

Edit `/mnt/okcomputer/output/app/src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '@/services/api';
import type { User, UserRole, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(response => {
          if (response.success) {
            setUser(response.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await authAPI.register(data);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Step 3: Update Dashboards to Use Real API

Example for Admin Dashboard - update to fetch real data:

```typescript
// In AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { adminAPI, subjectsAPI, teachersAPI } from '@/services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, subjectsRes, teachersRes] = await Promise.all([
        adminAPI.getStats(),
        subjectsAPI.getAll(),
        teachersAPI.getAll(),
      ]);

      setStats(statsRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

---

## 🔧 Troubleshooting <a name="troubleshooting"></a>

### Common Issues and Solutions

#### 1. "Cannot connect to database"
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env
- Verify password is correct

#### 2. "CORS error"
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solution:**
- Update FRONTEND_URL in backend .env to match your frontend URL
- Make sure it includes http:// or https://

#### 3. "JWT token invalid"
```
Error: Invalid token
```
**Solution:**
- Clear localStorage and login again
- Check JWT_SECRET is set correctly
- Token might be expired

#### 4. "File upload fails"
```
Error: File too large
```
**Solution:**
- Check file size limit in upload middleware (5MB default)
- Verify Cloudinary credentials

#### 5. "Changes not reflecting after deployment"
**Solution:**
- Clear browser cache (Ctrl+Shift+R)
- Check if build succeeded
- Verify environment variables are set

---

## 📋 Deployment Checklist

### Before Deploying Backend:
- [ ] Database migrations run successfully
- [ ] All environment variables set
- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] Cloudinary credentials working
- [ ] API tested locally

### Before Deploying Frontend:
- [ ] VITE_API_URL points to correct backend
- [ ] Build succeeds without errors
- [ ] All images copied to dist folder
- [ ] Environment variables set in Vercel

### After Deployment:
- [ ] Health check endpoint works
- [ ] Login/Register works
- [ ] Database queries work
- [ ] File uploads work
- [ ] All dashboards load correctly

---

## 💰 Cost Summary

### FREE Tier Limits:
| Service | Free Tier | When to Upgrade |
|---------|-----------|-----------------|
| Vercel | Unlimited bandwidth | Never (very generous) |
| Railway | $5/month credit | > 500 hours uptime |
| Supabase | 500MB DB, 2GB bandwidth | > 500MB data |
| Cloudinary | 25GB storage | > 25GB images |

### Estimated Costs (if exceeding free tier):
- **Small** (100 users): ~$10/month
- **Medium** (1000 users): ~$30/month
- **Large** (10000 users): ~$100/month

---

## 📞 Need Help?

### Resources:
- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com
- **Supabase Docs:** https://supabase.com/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs

### Debug Commands:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# View backend logs
railway logs

# View frontend build errors
npm run build 2>&1
```

---

**You're all set!** 🎉 Follow this guide step-by-step and your platform will be live!
