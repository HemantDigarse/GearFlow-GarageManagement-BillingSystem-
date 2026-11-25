#!/bin/bash
# ============================================================
# Nagios Check: Docker Container Status
# Usage: check_docker_container.sh <container_name>
# ============================================================

CONTAINER=$1

if [ -z "$CONTAINER" ]; then
    echo "UNKNOWN - No container name specified"
    exit 3
fi

# Check if container exists
STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "CRITICAL - Container '$CONTAINER' not found"
    exit 2
fi

case "$STATUS" in
    running)
        # Get uptime
        STARTED=$(docker inspect --format='{{.State.StartedAt}}' "$CONTAINER")
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "none")
        
        if [ "$HEALTH" = "unhealthy" ]; then
            echo "WARNING - Container '$CONTAINER' is running but UNHEALTHY since $STARTED"
            exit 1
        fi
        
        echo "OK - Container '$CONTAINER' is running (health: $HEALTH) since $STARTED"
        exit 0
        ;;
    exited)
        EXIT_CODE=$(docker inspect --format='{{.State.ExitCode}}' "$CONTAINER")
        echo "CRITICAL - Container '$CONTAINER' has exited with code $EXIT_CODE"
        exit 2
        ;;
    restarting)
        echo "WARNING - Container '$CONTAINER' is restarting"
        exit 1
        ;;
    *)
        echo "UNKNOWN - Container '$CONTAINER' status: $STATUS"
        exit 3
        ;;
esac
