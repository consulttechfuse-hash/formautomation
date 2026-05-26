#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Add Cloudflare Turnstile Keys to Vercel${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if logged in
echo -e "${YELLOW}📋 Checking Vercel login status...${NC}"
vercel whoami 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}🔐 Please log in to Vercel:${NC}"
    vercel login
fi

echo ""
echo -e "${YELLOW}📝 Enter your Cloudflare Turnstile Keys${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get Site Key
read -p "🔑 Enter your NEXT_PUBLIC_TURNSTILE_SITE_KEY: " 0x4AAAAAADU_cAvxHZiX7mNO
if [ -z "$SITE_KEY" ]; then
    echo -e "${RED}❌ Site key cannot be empty${NC}"
    exit 1
fi

# Get Secret Key
read -p "🔒 Enter your TURNSTILE_SECRET_KEY: " 0x4AAAAAADU_cIxtuFX7GKcIBE_AxEeMIdE
if [ -z "$SECRET_KEY" ]; then
    echo -e "${RED}❌ Secret key cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📤 Adding environment variables to Vercel...${NC}"
echo ""

# Add the keys to Vercel
echo "$SECRET_KEY" | vercel env add TURNSTILE_SECRET_KEY production
echo "$SITE_KEY" | vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production

echo ""
echo -e "${GREEN}✅ Keys added successfully!${NC}"
echo ""

# Verify the keys were added
echo -e "${YELLOW}📋 Verifying environment variables...${NC}"
vercel env ls

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Now redeploy with: vercel --prod${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
