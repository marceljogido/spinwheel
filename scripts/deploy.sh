#!/bin/bash

# 🚀 Prize Wheel App - Deployment Script
# This script helps you deploy the app to various platforms

echo "🎯 Prize Wheel App - Deployment Helper"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to build the project
build_project() {
    echo "📦 Building project for production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
    else
        echo "❌ Build failed!"
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "📥 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    
    echo "✅ Deployed to Vercel!"
    echo "🌐 Check your Vercel dashboard for the URL"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🚀 Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo "📥 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build first
    build_project
    
    # Deploy
    netlify deploy --prod --dir=dist
    
    echo "✅ Deployed to Netlify!"
    echo "🌐 Check your Netlify dashboard for the URL"
}

# Function to prepare for GitHub Pages
prepare_github_pages() {
    echo "📋 Preparing for GitHub Pages..."
    
    # Build the project
    build_project
    
    # Create .nojekyll file for GitHub Pages
    touch dist/.nojekyll
    
    echo "✅ Ready for GitHub Pages!"
    echo "📝 Next steps:"
    echo "   1. Push your code to GitHub"
    echo "   2. Go to repository Settings > Pages"
    echo "   3. Select source: GitHub Actions"
    echo "   4. The workflow will automatically deploy"
}

# Main menu
echo ""
echo "Select deployment option:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) GitHub Pages"
echo "4) Build only (for manual deployment)"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        build_project
        deploy_vercel
        ;;
    2)
        deploy_netlify
        ;;
    3)
        prepare_github_pages
        ;;
    4)
        build_project
        echo "📁 Build files are in the 'dist' directory"
        echo "📤 You can now upload the 'dist' folder to any hosting provider"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "📖 For more details, check the deploy.md file"
