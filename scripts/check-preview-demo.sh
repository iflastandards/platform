#!/bin/bash

# Check if demo mode is configured on preview server
# Exit codes: 0 = demo enabled, 1 = demo disabled, 2 = could not determine

PREVIEW_URL="https://admin-iflastandards-preview.onrender.com"

echo "Checking demo mode on preview server..."
echo "URL: $PREVIEW_URL"

# Check if server is accessible
if ! curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL" | grep -q "200"; then
  echo "❌ Preview server is not accessible"
  exit 2
fi

echo "✅ Preview server is accessible"

# Check demo status endpoint
DEMO_STATUS=$(curl -s "$PREVIEW_URL/api/demo-status" 2>/dev/null)

if echo "$DEMO_STATUS" | grep -q '"isDemoMode":true'; then
  echo "✅ Demo mode is ENABLED on preview"
  echo "$DEMO_STATUS" | python3 -m json.tool 2>/dev/null || echo "$DEMO_STATUS"
  exit 0
elif echo "$DEMO_STATUS" | grep -q '"isDemoMode":false'; then
  echo "❌ Demo mode is DISABLED on preview"
  echo "$DEMO_STATUS" | python3 -m json.tool 2>/dev/null || echo "$DEMO_STATUS"
  exit 1
else
  echo "⚠️  Could not determine demo mode status"
  echo "Response: $DEMO_STATUS"
  
  # Try to check if the endpoint exists
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL/api/demo-status")
  echo "Status code: $STATUS_CODE"
  
  if [ "$STATUS_CODE" = "404" ]; then
    echo ""
    echo "The /api/demo-status endpoint is not deployed yet."
    echo "This means the latest code with demo mode checks hasn't been deployed to preview."
    echo ""
    echo "To deploy the latest code:"
    echo "1. Commit and push the changes"
    echo "2. Wait for Render to automatically deploy"
    echo "3. Or manually trigger a deploy in Render dashboard"
  fi
  
  exit 2
fi