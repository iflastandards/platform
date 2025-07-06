#!/bin/bash

# Demo script for admin portal integration
# Starts admin and newtest site, then opens both in browser

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DEMO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/admin" ]; then
    print_error "Please run this script from the workspace root directory"
    exit 1
fi

# Kill any existing processes on our target ports
print_status "Cleaning up existing processes..."
pnpm ports:kill:verbose || true

# Set environment for Docusaurus
export DOCS_ENV=local

print_status "Starting admin portal and newtest site..."
print_warning "This will start two development servers:"
print_warning "  • Admin Portal: http://localhost:3007"
print_warning "  • newtest Site: http://localhost:3008/newtest/"
echo

# Start admin portal in background
print_status "Starting admin portal..."
nx serve admin > /dev/null 2>&1 &
ADMIN_PID=$!

# Start newtest site in background  
print_status "Starting newtest site..."
nx start newtest > /dev/null 2>&1 &
NEWTEST_PID=$!

# Function to cleanup processes on exit
cleanup() {
    print_status "Cleaning up processes..."
    kill $ADMIN_PID 2>/dev/null || true
    kill $NEWTEST_PID 2>/dev/null || true
    pnpm ports:kill > /dev/null 2>&1 || true
    print_success "Demo stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Wait for services to start
print_status "Waiting for services to start..."

# Wait for admin portal (max 30 seconds)
ADMIN_READY=false
for i in {1..30}; do
    if curl -s http://localhost:3007 > /dev/null 2>&1; then
        ADMIN_READY=true
        break
    fi
    sleep 1
    printf "."
done
echo

if [ "$ADMIN_READY" = false ]; then
    print_error "Admin portal failed to start after 30 seconds"
    exit 1
fi

print_success "Admin portal is ready at http://localhost:3007"

# Wait for newtest site (max 30 seconds)
NEWTEST_READY=false
for i in {1..30}; do
    if curl -s http://localhost:3008/newtest/ > /dev/null 2>&1; then
        NEWTEST_READY=true
        break
    fi
    sleep 1
    printf "."
done
echo

if [ "$NEWTEST_READY" = false ]; then
    print_error "newtest site failed to start after 30 seconds"
    exit 1
fi

print_success "newtest site is ready at http://localhost:3008/newtest/"

# Open browsers in Chrome specifically
print_status "Opening browsers in Chrome..."

if command -v open > /dev/null 2>&1; then
    # macOS - try Chrome first, fallback to default
    if open -a "Google Chrome" "http://localhost:3008/newtest/" 2>/dev/null; then
        sleep 2
        open -a "Google Chrome" "http://localhost:3007" 2>/dev/null || open "http://localhost:3007"
    else
        print_warning "Chrome not found, using default browser"
        open "http://localhost:3008/newtest/"
        sleep 2
        open "http://localhost:3007"
    fi
elif command -v google-chrome > /dev/null 2>&1; then
    # Linux - try Chrome variants
    google-chrome "http://localhost:3008/newtest/" &
    sleep 2
    google-chrome "http://localhost:3007" &
elif command -v chromium-browser > /dev/null 2>&1; then
    # Linux - Chromium
    chromium-browser "http://localhost:3008/newtest/" &
    sleep 2
    chromium-browser "http://localhost:3007" &
elif command -v start > /dev/null 2>&1; then
    # Windows - try Chrome first
    if start chrome "http://localhost:3008/newtest/" 2>/dev/null; then
        sleep 2
        start chrome "http://localhost:3007" 2>/dev/null || start "http://localhost:3007"
    else
        print_warning "Chrome not found, using default browser"
        start "http://localhost:3008/newtest/"
        sleep 2
        start "http://localhost:3007"
    fi
else
    print_warning "Could not detect browser command. Please manually open:"
    print_warning "  • newtest site: http://localhost:3008/newtest/"
    print_warning "  • Admin portal: http://localhost:3007"
fi

print_success "Demo started successfully!"
echo
print_status "🎯 DEMO INSTRUCTIONS:"
echo -e "  ${GREEN}1.${NC} Visit the newtest site: ${BLUE}http://localhost:3008/newtest/${NC}"
echo -e "  ${GREEN}2.${NC} Look for the ${YELLOW}'Manage Site'${NC} button in the top-right navbar"
echo -e "  ${GREEN}3.${NC} Click it to open the admin portal for this site"
echo -e "  ${GREEN}4.${NC} Sign in with GitHub to access site management"
echo
print_status "🔧 TESTING WORKFLOW:"
echo -e "  ${GREEN}•${NC} The navbar integration allows seamless admin access"
echo -e "  ${GREEN}•${NC} Authentication is handled by NextAuth v5"
echo -e "  ${GREEN}•${NC} Site owner gets automatic admin privileges"
echo
print_warning "Press Ctrl+C to stop the demo and clean up processes"

# Keep script running
while true; do
    sleep 1
done