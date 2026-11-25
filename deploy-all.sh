#!/bin/bash
# ============================================================
# GearFlow - Master Deployment Script
# ============================================================
# One-command deployment: Terraform → Build → Ansible → Deploy
#
# Prerequisites:
#   1. AWS CLI configured: aws configure
#   2. Terraform installed
#   3. Ansible installed
#   4. Docker installed
#   5. terraform/terraform.tfvars filled in
#   6. ansible/vars.yml filled in
#
# Usage: chmod +x deploy-all.sh && ./deploy-all.sh
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

print_step() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${GREEN}  ✅ $1${NC}"; echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }
print_header() { echo -e "\n${YELLOW}🔧 $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║   🔧 GearFlow — Full Deployment Pipeline      ║"
echo "║   Terraform → Docker → Ansible → Deploy       ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

# ===================== PRE-FLIGHT CHECKS ========================
print_header "Step 0: Pre-flight checks..."

check_tool() {
    if ! command -v "$1" &>/dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
    echo "  ✓ $1 found: $(command -v $1)"
}

check_tool "aws"
check_tool "terraform"
check_tool "ansible-playbook"
check_tool "docker"

# Verify AWS credentials
AWS_ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null) || {
    print_error "AWS credentials not configured. Run: aws configure"
    exit 1
}
echo "  ✓ AWS Account: $AWS_ACCOUNT"

# Check terraform.tfvars exists
if [ ! -f "$SCRIPT_DIR/terraform/terraform.tfvars" ]; then
    print_error "terraform/terraform.tfvars not found!"
    echo "  Copy terraform/terraform.tfvars.example → terraform/terraform.tfvars"
    echo "  and fill in your values."
    exit 1
fi

# Check ansible vars.yml exists
if [ ! -f "$SCRIPT_DIR/ansible/vars.yml" ]; then
    print_error "ansible/vars.yml not found!"
    echo "  Copy ansible/vars.yml.example → ansible/vars.yml"
    echo "  and fill in your values."
    exit 1
fi

print_step "Pre-flight checks passed"

# ===================== PHASE 1: TERRAFORM ========================
print_header "Phase 1: Provisioning AWS Infrastructure with Terraform..."

cd "$SCRIPT_DIR/terraform"

# Initialize Terraform
echo "  → terraform init..."
terraform init -upgrade -input=false

# Plan
echo "  → terraform plan..."
terraform plan -out=tfplan -input=false

# Ask for confirmation
echo ""
read -p "  Apply this Terraform plan? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "  Aborted by user."
    exit 0
fi

# Apply
echo "  → terraform apply..."
terraform apply -input=false tfplan

# Capture outputs
EC2_IP=$(terraform output -raw ec2_public_ip)
RDS_HOST=$(terraform output -raw rds_hostname)
ECR_BACKEND=$(terraform output -raw ecr_backend_url)
ECR_FRONTEND=$(terraform output -raw ecr_frontend_url)
AWS_REGION=$(terraform output -raw aws_account_id | head -1 && echo "ap-south-1")

echo ""
echo "  EC2 IP:       $EC2_IP"
echo "  RDS Endpoint: $RDS_HOST"
echo "  ECR Backend:  $ECR_BACKEND"
echo "  ECR Frontend: $ECR_FRONTEND"

# Generate Ansible inventory from Terraform output
terraform output -raw ansible_inventory > "$SCRIPT_DIR/ansible/inventory.ini"
echo "  → Generated ansible/inventory.ini"

print_step "Phase 1 complete — AWS infrastructure provisioned"

# ===================== PHASE 2: BUILD DOCKER IMAGES ========================
print_header "Phase 2: Building Docker images..."

cd "$SCRIPT_DIR"

# Login to ECR
AWS_REGION_VAL=$(cd terraform && terraform output -raw 2>/dev/null | head -1 || echo "ap-south-1")
aws ecr get-login-password --region ap-south-1 | \
    docker login --username AWS --password-stdin \
    "${AWS_ACCOUNT}.dkr.ecr.ap-south-1.amazonaws.com"

IMAGE_TAG=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)
echo "  Image Tag: $IMAGE_TAG"

# Build backend
echo "  → Building backend..."
docker build -t "${ECR_BACKEND}:${IMAGE_TAG}" -t "${ECR_BACKEND}:latest" ./gearflow-backend

# Build frontend
echo "  → Building frontend..."
docker build -t "${ECR_FRONTEND}:${IMAGE_TAG}" -t "${ECR_FRONTEND}:latest" ./gearflow-frontend

# Push
echo "  → Pushing backend to ECR..."
docker push "${ECR_BACKEND}:${IMAGE_TAG}"
docker push "${ECR_BACKEND}:latest"

echo "  → Pushing frontend to ECR..."
docker push "${ECR_FRONTEND}:${IMAGE_TAG}"
docker push "${ECR_FRONTEND}:latest"

print_step "Phase 2 complete — Docker images pushed to ECR"

# ===================== PHASE 3: WAIT FOR EC2 ========================
print_header "Phase 3: Waiting for EC2 to be ready..."

echo "  Waiting 60 seconds for EC2 user-data script to finish..."
sleep 60

# Wait for SSH to be available
MAX_RETRIES=12
RETRY=0
while ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 \
    -i ~/.ssh/gearflow-key.pem ubuntu@${EC2_IP} "echo 'SSH OK'" 2>/dev/null; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        print_error "EC2 SSH not available after ${MAX_RETRIES} retries"
        echo "  Try manually: ssh -i ~/.ssh/gearflow-key.pem ubuntu@${EC2_IP}"
        exit 1
    fi
    echo "  Waiting for SSH... attempt $RETRY/$MAX_RETRIES"
    sleep 15
done

print_step "Phase 3 complete — EC2 is reachable via SSH"

# ===================== PHASE 4: ANSIBLE SETUP ========================
print_header "Phase 4: Configuring EC2 with Ansible (Docker, Nagios, Firewall)..."

cd "$SCRIPT_DIR/ansible"

ansible-playbook -i inventory.ini playbook-setup.yml --extra-vars "@vars.yml"

print_step "Phase 4 complete — EC2 configured"

# ===================== PHASE 5: DEPLOY APPLICATION ========================
print_header "Phase 5: Deploying GearFlow application..."

ansible-playbook -i inventory.ini playbook-deploy.yml --extra-vars "@vars.yml"

print_step "Phase 5 complete — Application deployed"

# ===================== DONE ========================
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════╗"
echo "║    🎉 GearFlow Deployed Successfully!          ║"
echo "╠════════════════════════════════════════════════╣"
echo "║                                                ║"
echo "║  🌐 Frontend: http://${EC2_IP}                 "
echo "║  ⚙️  Backend:  http://${EC2_IP}:8080            "
echo "║  📊 Health:   http://${EC2_IP}:8080/actuator/health"
echo "║                                                ║"
echo "║  🔑 Admin Login: admin / admin123              ║"
echo "║                                                ║"
echo "║  📡 SSH: ssh -i ~/.ssh/gearflow-key.pem        ║"
echo "║         ubuntu@${EC2_IP}                        "
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"
