#!/bin/bash

# Nano-banana-bot Setup Script
# This script helps set up the application for development

echo "🤖 Nano-banana-bot Setup"
echo "========================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created from .env.example"
else
    echo "✅ .env.local already exists"
fi

# Check if GEMINI_API_KEY is set
if grep -q "^GEMINI_API_KEY=" .env.local; then
    API_KEY=$(grep "^GEMINI_API_KEY=" .env.local | cut -d '=' -f 2)
    if [ "$API_KEY" = "your_gemini_api_key_here" ]; then
        echo ""
        echo "⚠️  GEMINI_API_KEY is not configured!"
        echo ""
        echo "Steps to configure:"
        echo "1. Visit: https://ai.google.dev/"
        echo "2. Sign in or create an account"
        echo "3. Create an API key"
        echo "4. Copy the key"
        echo "5. Edit .env.local and replace 'your_gemini_api_key_here' with your actual key"
        echo ""
    else
        echo "✅ GEMINI_API_KEY is configured"
    fi
else
    echo ""
    echo "⚠️  GEMINI_API_KEY not found in .env.local"
    echo "Please add it manually"
fi

echo ""
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencies already installed"
else
    echo "Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

echo ""
echo "Setup complete! 🚀"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
