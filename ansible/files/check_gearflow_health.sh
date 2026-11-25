#!/bin/bash
# ============================================================
# Nagios Check: GearFlow Application Health
# Usage: check_gearflow_health.sh <url>
# ============================================================

URL=$1
TIMEOUT=10

if [ -z "$URL" ]; then
    echo "UNKNOWN - No URL specified"
    exit 3
fi

# Make HTTP request
RESPONSE=$(curl -s -o /tmp/health_check_body -w "%{http_code}:%{time_total}" \
    --connect-timeout $TIMEOUT --max-time $TIMEOUT "$URL" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | cut -d: -f1)
RESPONSE_TIME=$(echo "$RESPONSE" | cut -d: -f2)

if [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "000" ]; then
    echo "CRITICAL - Cannot connect to $URL"
    exit 2
fi

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    # Check if response time is too high
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null | cut -d. -f1)
    
    if [ -n "$RESPONSE_MS" ] && [ "$RESPONSE_MS" -gt 5000 ]; then
        echo "WARNING - $URL responded HTTP $HTTP_CODE in ${RESPONSE_TIME}s (slow)"
        exit 1
    fi
    
    echo "OK - $URL responded HTTP $HTTP_CODE in ${RESPONSE_TIME}s"
    exit 0
elif [ "$HTTP_CODE" -ge 400 ] && [ "$HTTP_CODE" -lt 500 ]; then
    echo "WARNING - $URL responded HTTP $HTTP_CODE"
    exit 1
else
    echo "CRITICAL - $URL responded HTTP $HTTP_CODE"
    exit 2
fi
