# 🚀 Prize Wheel App - Deployment Script (PowerShell)
# This script helps you deploy the app to various platforms

Write-Host "🎯 Prize Wheel App - Deployment Helper" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Function to build the project
function Build-Project {
    Write-Host "📦 Building project for production..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Function to deploy to Vercel
function Deploy-Vercel {
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    
    # Check if Vercel CLI is installed
    try {
        vercel --version | Out-Null
    } catch {
        Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    # Deploy
    vercel --prod
    
    Write-Host "✅ Deployed to Vercel!" -ForegroundColor Green
    Write-Host "🌐 Check your Vercel dashboard for the URL" -ForegroundColor Cyan
}

# Function to deploy to Netlify
function Deploy-Netlify {
    Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Yellow
    
    # Check if Netlify CLI is installed
    try {
        netlify --version | Out-Null
    } catch {
        Write-Host "📥 Installing Netlify CLI..." -ForegroundColor Yellow
        npm install -g netlify-cli
    }
    
    # Build first
    Build-Project
    
    # Deploy
    netlify deploy --prod --dir=dist
    
    Write-Host "✅ Deployed to Netlify!" -ForegroundColor Green
    Write-Host "🌐 Check your Netlify dashboard for the URL" -ForegroundColor Cyan
}

# Function to prepare for GitHub Pages
function Prepare-GitHubPages {
    Write-Host "📋 Preparing for GitHub Pages..." -ForegroundColor Yellow
    
    # Build the project
    Build-Project
    
    # Create .nojekyll file for GitHub Pages
    New-Item -Path "dist\.nojekyll" -ItemType File -Force | Out-Null
    
    Write-Host "✅ Ready for GitHub Pages!" -ForegroundColor Green
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Push your code to GitHub" -ForegroundColor White
    Write-Host "   2. Go to repository Settings > Pages" -ForegroundColor White
    Write-Host "   3. Select source: GitHub Actions" -ForegroundColor White
    Write-Host "   4. The workflow will automatically deploy" -ForegroundColor White
}

# Main menu
Write-Host ""
Write-Host "Select deployment option:" -ForegroundColor Cyan
Write-Host "1) Vercel (Recommended)" -ForegroundColor White
Write-Host "2) Netlify" -ForegroundColor White
Write-Host "3) GitHub Pages" -ForegroundColor White
Write-Host "4) Build only (for manual deployment)" -ForegroundColor White
Write-Host "5) Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Build-Project
        Deploy-Vercel
    }
    "2" {
        Deploy-Netlify
    }
    "3" {
        Prepare-GitHubPages
    }
    "4" {
        Build-Project
        Write-Host "📁 Build files are in the 'dist' directory" -ForegroundColor Green
        Write-Host "📤 You can now upload the 'dist' folder to any hosting provider" -ForegroundColor Cyan
    }
    "5" {
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "📖 For more details, check the deploy.md file" -ForegroundColor Cyan
