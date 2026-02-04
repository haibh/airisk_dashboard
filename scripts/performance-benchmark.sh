#!/bin/bash
# AIRM-IP Performance Benchmark Script
# Run this after starting the dev/prod server
# Requires: curl, jq (optional for JSON parsing)

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
LOCALE="en"

echo "=============================================="
echo "AIRM-IP Performance Benchmark"
echo "=============================================="
echo "Base URL: $BASE_URL"
echo "Timestamp: $(date -Iseconds)"
echo ""

# Function to measure API response time
measure_api() {
    local endpoint=$1
    local name=$2

    # Get timing info using curl
    local result=$(curl -s -o /dev/null -w "%{time_total},%{http_code}" "$BASE_URL$endpoint" 2>/dev/null || echo "0,000")
    local time=$(echo $result | cut -d',' -f1)
    local code=$(echo $result | cut -d',' -f2)

    # Convert to milliseconds
    local ms=$(echo "$time * 1000" | bc 2>/dev/null || echo "N/A")

    printf "%-35s %8s ms  (HTTP %s)\n" "$name" "$ms" "$code"
}

echo "=== API Response Times (Target: <500ms P95) ==="
echo ""

# Dashboard APIs (authenticated - may return 401)
measure_api "/api/dashboard/stats" "Dashboard Stats"
measure_api "/api/dashboard/risk-heatmap" "Risk Heatmap"
measure_api "/api/dashboard/compliance" "Compliance"
measure_api "/api/dashboard/activity" "Activity Feed"

# Public APIs
measure_api "/api/frameworks" "Frameworks List"
measure_api "/api/ai-systems" "AI Systems List"
measure_api "/api/assessments" "Assessments List"

echo ""
echo "=== Page Load Times (Target: <3s) ==="
echo ""

# Page load times
measure_api "/$LOCALE/login" "Login Page"
measure_api "/$LOCALE/dashboard" "Dashboard Page"
measure_api "/$LOCALE/ai-systems" "AI Systems Page"
measure_api "/$LOCALE/frameworks" "Frameworks Page"

echo ""
echo "=============================================="
echo "Benchmark Complete"
echo ""
echo "NOTES:"
echo "- API endpoints may return 401 if not authenticated"
echo "- For accurate page load, use browser DevTools or Lighthouse"
echo "- Production benchmark should use: npm run build && npm start"
echo "=============================================="
