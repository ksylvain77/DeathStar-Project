#!/bin/bash

# Configuration
BASE_URL="http://192.168.50.92:8080"
USERNAME="kevin"
PASSWORD="kevinkevin"
COOKIE_FILE="cookies.txt"

echo "Testing qBittorrent API authentication..."
echo "Base URL: $BASE_URL"
echo "Username: $USERNAME"

# Clean up any existing cookie file
rm -f "$COOKIE_FILE"

# Step 1: Check WebUI accessibility
echo -e "\n1. Checking WebUI accessibility..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" > /tmp/webui_status
WEBUI_STATUS=$(cat /tmp/webui_status)
echo "WebUI Status Code: $WEBUI_STATUS"

if [ "$WEBUI_STATUS" != "200" ]; then
    echo "Error: WebUI is not accessible"
    exit 1
fi

# Step 2: Attempt login
echo -e "\n2. Attempting login..."
LOGIN_RESPONSE=$(curl -v -c "$COOKIE_FILE" \
     -d "username=$USERNAME&password=$PASSWORD" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -H "Referer: $BASE_URL" \
     -H "Origin: $BASE_URL" \
     "$BASE_URL/api/v2/auth/login" 2>&1)

echo "Login Response: $LOGIN_RESPONSE"

# Check if login was successful
if [[ "$LOGIN_RESPONSE" == *"Fails"* ]]; then
    echo "Login failed - incorrect credentials"
    exit 1
fi

# Display cookie file contents
echo -e "\nCookie file contents:"
cat "$COOKIE_FILE"

# Step 3: Test version endpoint
echo -e "\n3. Testing version endpoint..."
curl -v -b "$COOKIE_FILE" \
     -H "Content-Type: application/json" \
     -H "Referer: $BASE_URL" \
     -H "Origin: $BASE_URL" \
     "$BASE_URL/api/v2/app/version"

# Step 4: Test alternative endpoint
echo -e "\n4. Testing alternative endpoint..."
curl -v -b "$COOKIE_FILE" \
     -H "Content-Type: application/json" \
     -H "Referer: $BASE_URL" \
     -H "Origin: $BASE_URL" \
     "$BASE_URL/api/v2/sync/maindata"

# Clean up
rm -f "$COOKIE_FILE"
rm -f /tmp/webui_status 