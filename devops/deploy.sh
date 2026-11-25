#!/bin/bash
# ============================================================
# GearFlow - Deploy to EC2 (run this ON the EC2 instance)
# ============================================================
# This script pulls the latest images from ECR and deploys
#
# Usage: chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -euo pipefail

# ===================== CONFIGURATION ========================
# These should be set in your .env file or exported
AWS_REGION="${AWS_REGION:-ap-south-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:?'Set AWS_ACCOUNT_ID in .env'}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DEPLOY_DIR="/home/ubuntu/gearflow"

echo "============================================"
echo "  GearFlow - Deploying to EC2"
echo "  Image Tag: $IMAGE_TAG"
echo "============================================"

cd $DEPLOY_DIR

# Source environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "   ✅ Loaded .env"
fi

# ===================== 1. LOGIN TO ECR ========================
echo ""
echo "🔑 Step 1: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY
echo "   ✅ ECR login successful"

# ===================== 2. PULL LATEST IMAGES ========================
echo ""
echo "📥 Step 2: Pulling latest images..."
docker pull ${ECR_REGISTRY}/gearflow-backend:${IMAGE_TAG}
docker pull ${ECR_REGISTRY}/gearflow-frontend:${IMAGE_TAG}
echo "   ✅ Images pulled"

# ===================== 3. STOP OLD CONTAINERS ========================
echo ""
echo "🛑 Step 3: Stopping old containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
echo "   ✅ Old containers stopped"

# ===================== 4. START NEW CONTAINERS ========================
echo ""
echo "🚀 Step 4: Starting new containers..."
docker compose -f docker-compose.prod.yml up -d
echo "   ✅ Containers started"

# ===================== 5. CLEANUP ========================
echo ""
echo "🧹 Step 5: Cleaning up old images..."
docker image prune -af
echo "   ✅ Cleanup done"

# ===================== 6. HEALTH CHECK ========================
echo ""
echo "🏥 Step 6: Running health checks..."
echo "   Waiting 60 seconds for services to initialize..."
sleep 60

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")

echo "   Backend  health: HTTP $BACKEND_STATUS"
echo "   Frontend health: HTTP $FRONTEND_STATUS"

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    echo ""
    echo "============================================"
    echo "  ✅ Deployment Successful!"
    echo "  Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo "  Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
    echo "============================================"
else
    echo ""
    echo "⚠️  Some health checks failed. Checking logs..."
    docker compose -f docker-compose.prod.yml logs --tail=20
fi
