#!/bin/bash

# Direct shell script to start all services without nx interception
# This bypasses the pnpm/nx recursion issue

echo "🚀 Starting all IFLA Standards services..."
echo ""

# Step 1: Kill existing processes
echo "📍 Stopping existing services..."
lsof -ti:3000,3001,3002,3003,3004,3005,3006,3007,3008 | xargs kill -9 2>/dev/null || true
pkill -f 'docusaurus start' 2>/dev/null || true
echo "✅ Done"
echo ""

# Step 2: Build theme
echo "📍 Building @ifla/theme..."
./node_modules/.bin/nx build @ifla/theme || exit 1
echo "✅ Theme built"
echo ""

# Step 3: Start all services
echo "📍 Starting all services..."
echo ""
echo "Services will be available at:"
echo "  Portal:    http://localhost:3000"
echo "  ISBDM:     http://localhost:3001"
echo "  LRM:       http://localhost:3002"
echo "  FRBR:      http://localhost:3003"
echo "  ISBD:      http://localhost:3004"
echo "  Muldicat:  http://localhost:3005"
echo "  UNIMARC:   http://localhost:3006"
echo "  Admin:     http://localhost:3007"
echo ""

# Use local concurrently binary directly
./node_modules/.bin/concurrently \
  --prefix "[{index}]" \
  --names "portal,isbdm,lrm,frbr,isbd,muldicat,unimarc,admin" \
  "DOCS_ENV=local ./node_modules/.bin/docusaurus start portal --port 3000" \
  "DOCS_ENV=local ./node_modules/.bin/docusaurus start standards/ISBDM --port 3001" \
  "DOCS_ENV=local ./node_modules/.bin/docusaurus start standards/LRM --port 3002" \
  "DOCS_ENV=local ./node_modules/.bin/docusaurus start standards/FRBR --port 3003" \
  "DOCS_ENV=local ./node_modules/.bin/docusaurus start standards/isbd --port 3004" \
  "DOCS_ENV=local ./node_modules/.bin/docusaurus start standards/muldicat --port 3005" \
  "DOCS_ENV=local ./node_modules/.bin/docusaurus start standards/unimarc --port 3006" \
  "./node_modules/.bin/nx dev admin"