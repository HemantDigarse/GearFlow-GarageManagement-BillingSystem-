#!/bin/bash
# ============================================================
# GearFlow - Build & Push Docker Images to ECR
# ============================================================
# Run this from the project root directory (d:\GearFlow)
#
# Usage: chmod +x devops/build-and-push.sh && ./devops/build-and-push.sh
# ============================================================

set -euo pipefail

# ===================== CONFIGURATION ========================
AWS_REGION="${AWS_REGION:-ap-south-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query 'Account' --output text)}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"

echo "============================================"
echo "  GearFlow - Build & Push to ECR"
echo "  Registry: $ECR_REGISTRY"
echo "  Tag:      $IMAGE_TAG"
echo "============================================"

# ===================== 1. LOGIN TO ECR ========================
echo ""
echo "🔑 Step 1: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY
echo "   ✅ ECR login successful"

# ===================== 2. BUILD BACKEND ========================
echo ""
echo "🔨 Step 2: Building Backend Docker image..."
docker build \
    -t ${ECR_REGISTRY}/gearflow-backend:${IMAGE_TAG} \
    -t ${ECR_REGISTRY}/gearflow-backend:latest \
    ./gearflow-backend
echo "   ✅ Backend image built"

# ===================== 3. BUILD FRONTEND ========================
echo ""
echo "🔨 Step 3: Building Frontend Docker image..."
docker build \
    -t ${ECR_REGISTRY}/gearflow-frontend:${IMAGE_TAG} \
    -t ${ECR_REGISTRY}/gearflow-frontend:latest \
    ./gearflow-frontend
echo "   ✅ Frontend image built"

# ===================== 4. PUSH BACKEND ========================
echo ""
echo "📤 Step 4: Pushing Backend image to ECR..."
docker push ${ECR_REGISTRY}/gearflow-backend:${IMAGE_TAG}
docker push ${ECR_REGISTRY}/gearflow-backend:latest
echo "   ✅ Backend pushed"

# ===================== 5. PUSH FRONTEND ========================
echo ""
echo "📤 Step 5: Pushing Frontend image to ECR..."
docker push ${ECR_REGISTRY}/gearflow-frontend:${IMAGE_TAG}
docker push ${ECR_REGISTRY}/gearflow-frontend:latest
echo "   ✅ Frontend pushed"

echo ""
echo "============================================"
echo "  ✅ All images built and pushed!"
echo ""
echo "  Backend:  ${ECR_REGISTRY}/gearflow-backend:${IMAGE_TAG}"
echo "  Frontend: ${ECR_REGISTRY}/gearflow-frontend:${IMAGE_TAG}"
echo "============================================"
