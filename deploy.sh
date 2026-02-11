#!/bin/bash

# IkLearnEdge Deployment Helper Script
# This script helps you prepare the project for deployment

echo "🚀 IkLearnEdge Deployment Helper"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -d "app" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Preparing Frontend for Deployment..."
cd app

# Install dependencies
echo "  → Installing frontend dependencies..."
npm install

# Build frontend
echo "  → Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "  ✅ Frontend build successful!"
else
    echo "  ❌ Frontend build failed!"
    exit 1
fi

cd ..

echo ""
echo "📦 Preparing Backend for Deployment..."
cd backend

# Install dependencies
echo "  → Installing backend dependencies..."
npm install

cd ..

echo ""
echo "✅ Preparation Complete!"
echo ""
echo "Next Steps:"
echo "-----------"
echo ""
echo "1. 📤 Push Frontend to GitHub:"
echo "   cd app"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial frontend'"
echo "   git remote add origin https://github.com/YOUR_USERNAME/iklearnedge-frontend.git"
echo "   git push -u origin main"
echo ""
echo "2. 📤 Push Backend to GitHub:"
echo "   cd backend"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial backend'"
echo "   git remote add origin https://github.com/YOUR_USERNAME/iklearnedge-backend.git"
echo "   git push -u origin main"
echo ""
echo "3. 🗄️  Set up Supabase Database:"
echo "   - Go to https://supabase.com"
echo "   - Create new project"
echo "   - Run migrations from backend/database/migrations/001_initial_schema.sql"
echo ""
echo "4. 🚂 Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your backend GitHub repo"
echo "   - Add environment variables"
echo ""
echo "5. 🌐 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your frontend GitHub repo"
echo "   - Set VITE_API_URL to your Railway URL"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
