# IkLearnEdge - Complete Deployment Guide

This guide will walk you through deploying the IkLearnEdge tutoring platform (frontend + backend + database) to production.

## Overview

The platform consists of three parts:
1. **Frontend** (React + Vite) → Deploy to Vercel
2. **Backend** (Node.js + Express) → Deploy to Railway
3. **Database** (PostgreSQL) → Deploy to Supabase

---

## Step 1: Deploy Database (Supabase)

### 1.1 Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Click "New Project"
4. Enter project name: `iklearnedge-db`
5. Choose a region (closest to your users - Dubai: `Middle East`)
6. Click "Create new project"

### 1.2 Run Database Migrations
1. In Supabase dashboard, go to "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy the contents of `backend/database/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run"

### 1.3 Get Database Connection String
1. Go to "Settings" (gear icon) → "Database"
2. Scroll down to "Connection string"
3. Click "URI" tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
5. Save this - you'll need it for Railway deployment

---

## Step 2: Deploy Backend (Railway)

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"

### 2.2 Push Backend to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main

# Create a new GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/iklearnedge-backend.git
git push -u origin main
```

### 2.3 Deploy on Railway
1. In Railway, select your backend repository
2. Railway will auto-detect it's a Node.js app
3. Click "Deploy"
4. Wait for deployment to complete

### 2.4 Add Environment Variables
1. In Railway dashboard, click on your service
2. Go to "Variables" tab
3. Add the following variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_supabase_connection_string_from_step_1
JWT_SECRET=your_super_secret_random_string_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.vercel.app

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

To get Cloudinary credentials:
1. Go to https://cloudinary.com
2. Sign up for free
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret

### 2.5 Get Backend URL
1. In Railway dashboard, go to "Settings" tab
2. Under "Environment", find your service URL
3. It looks like: `https://iklearnedge-api.up.railway.app`
4. Save this - you'll need it for frontend deployment

---

## Step 3: Deploy Frontend (Vercel)

### 3.1 Update Environment Variables
Edit `app/.env` file:
```env
VITE_API_URL=https://your-railway-backend-url/api
```

### 3.2 Push Frontend to GitHub
```bash
cd app
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main

# Create a new GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/iklearnedge-frontend.git
git push -u origin main
```

### 3.3 Deploy on Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your frontend repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `./` (or `app/` if your repo root is different)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-backend-url/api`
7. Click "Deploy"

### 3.4 Get Frontend URL
1. After deployment, Vercel will give you a URL
2. It looks like: `https://iklearnedge.vercel.app`
3. Save this - you need to add it to Railway's CORS settings

---

## Step 4: Update CORS (Important!)

### 4.1 Update Railway Environment Variable
1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` environment variable to your Vercel URL
3. Redeploy the backend

---

## Step 5: Create Admin User

### 5.1 Using API Directly
You need to create an admin user in the database. Use Supabase SQL Editor:

```sql
-- Create admin user (password will be hashed by the application)
INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
VALUES (
  'admin@iklearnedge.com',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt to hash: 'admin123'
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
);
```

Or use the registration API:
```bash
curl -X POST https://your-railway-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iklearnedge.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

Then manually update the role to 'admin' in Supabase:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@iklearnedge.com';
```

---

## Step 6: Verify Deployment

### 6.1 Test Backend Health
Open in browser:
```
https://your-railway-backend-url/api/health
```
Should return: `{"status":"ok"}`

### 6.2 Test Frontend
Open your Vercel URL and verify:
- Homepage loads
- Login works
- Dashboards are accessible

### 6.3 Test API Connection
1. Open browser console (F12)
2. Try logging in
3. Check Network tab for API calls
4. Verify no CORS errors

---

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed locally (or use Supabase)

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# For local development, use local PostgreSQL or Supabase

# Run migrations
psql -d your_database -f database/migrations/001_initial_schema.sql

# Start server
npm run dev
```

### Frontend Setup
```bash
cd app
npm install

# Create .env file
cp .env.example .env

# Edit .env - point to local backend
VITE_API_URL=http://localhost:5000/api

# Start dev server
npm run dev
```

---

## Troubleshooting

### CORS Errors
If you see CORS errors in browser:
1. Check `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. Make sure there's no trailing slash
3. Include `https://`

### Database Connection Errors
1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Ensure IP allowlist includes Railway (0.0.0.0/0 for testing)

### File Upload Not Working
1. Verify Cloudinary credentials
2. Check file size limits (max 5MB)
3. Ensure proper file types (jpg, png, pdf)

### Login Not Working
1. Check JWT_SECRET is set
2. Verify admin user exists in database
3. Check browser console for errors

---

## Maintenance

### Updating the Application

#### Update Frontend
```bash
cd app
# Make changes
git add .
git commit -m "Update description"
git push origin main
# Vercel will auto-deploy
```

#### Update Backend
```bash
cd backend
# Make changes
git add .
git commit -m "Update description"
git push origin main
# Railway will auto-deploy
```

### Database Backups
Supabase automatically backs up your database. To restore:
1. Go to Supabase Dashboard
2. Settings → Database
3. Click "Restore" and select a backup

### Monitoring
- **Vercel**: Built-in analytics and logs
- **Railway**: Metrics and logs in dashboard
- **Supabase**: Database metrics and query logs

---

## Cost Estimation (Monthly)

| Service | Free Tier | Paid (Starter) |
|---------|-----------|----------------|
| Vercel | 100GB bandwidth | $20/mo |
| Railway | $5 credit/mo | $5+/mo |
| Supabase | 500MB DB, 2GB transfer | $25/mo |
| Cloudinary | 25GB storage | $25/mo |
| **Total** | **FREE** | **~$75/mo** |

For a small tutoring platform, the free tiers should be sufficient initially.

---

## Support

If you encounter issues:
1. Check the logs in Railway/Vercel dashboards
2. Review the COMPLETE_CONNECTION_GUIDE.md
3. Check the HOW_TO_EDIT.md for code modifications

---

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure email notifications (SendGrid/Resend)
3. ✅ Set up monitoring (Sentry)
4. ✅ Add Google Analytics
5. ✅ Configure SSL certificate (auto on Vercel/Railway)

---

**Your IkLearnEdge platform is now live! 🎉**
