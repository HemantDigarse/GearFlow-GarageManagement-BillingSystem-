#!/bin/bash
# ============================================================
# GearFlow - AWS Infrastructure Setup Script
# ============================================================
# This script creates all required AWS resources:
#   - VPC, Subnets, Security Groups
#   - ECR Repositories
#   - RDS MySQL Instance
#   - EC2 Instance
#   - IAM Roles
#   - CloudWatch Log Groups
#
# Prerequisites:
#   - AWS CLI v2 installed and configured
#   - Sufficient IAM permissions
#
# Usage: chmod +x aws-setup.sh && ./aws-setup.sh
# ============================================================

set -euo pipefail

# ===================== CONFIGURATION ========================
PROJECT_NAME="gearflow"
AWS_REGION="ap-south-1"
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_1_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_2_CIDR="10.0.2.0/24"
PRIVATE_SUBNET_1_CIDR="10.0.3.0/24"
PRIVATE_SUBNET_2_CIDR="10.0.4.0/24"
EC2_INSTANCE_TYPE="t3.medium"
EC2_AMI="ami-0dee22c13ea7a9a67"  # Ubuntu 22.04 LTS ap-south-1 (update for your region)
EC2_KEY_NAME="gearflow-key"      # Create this key pair first in AWS Console
RDS_INSTANCE_CLASS="db.t3.micro"
RDS_DB_NAME="gearflow"
RDS_MASTER_USER="gearflow_admin"
RDS_MASTER_PASSWORD="ChangeThisPassword123!"  # CHANGE THIS!

echo "============================================"
echo "  GearFlow - AWS Infrastructure Setup"
echo "  Region: $AWS_REGION"
echo "============================================"

# ===================== 1. VPC ========================
echo ""
echo "📦 Step 1: Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block $VPC_CIDR \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-vpc},{Key=Project,Value=${PROJECT_NAME}}]" \
    --region $AWS_REGION \
    --query 'Vpc.VpcId' --output text)
echo "   VPC created: $VPC_ID"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames "{\"Value\":true}" --region $AWS_REGION
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support "{\"Value\":true}" --region $AWS_REGION

# ===================== 2. SUBNETS ========================
echo ""
echo "📦 Step 2: Creating Subnets..."

# Get availability zones
AZ1=$(aws ec2 describe-availability-zones --region $AWS_REGION --query 'AvailabilityZones[0].ZoneName' --output text)
AZ2=$(aws ec2 describe-availability-zones --region $AWS_REGION --query 'AvailabilityZones[1].ZoneName' --output text)

PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID --cidr-block $PUBLIC_SUBNET_1_CIDR --availability-zone $AZ1 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-1}]" \
    --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
echo "   Public Subnet 1: $PUBLIC_SUBNET_1 ($AZ1)"

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID --cidr-block $PUBLIC_SUBNET_2_CIDR --availability-zone $AZ2 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-2}]" \
    --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
echo "   Public Subnet 2: $PUBLIC_SUBNET_2 ($AZ2)"

PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID --cidr-block $PRIVATE_SUBNET_1_CIDR --availability-zone $AZ1 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-1}]" \
    --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
echo "   Private Subnet 1: $PRIVATE_SUBNET_1 ($AZ1)"

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID --cidr-block $PRIVATE_SUBNET_2_CIDR --availability-zone $AZ2 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-2}]" \
    --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
echo "   Private Subnet 2: $PRIVATE_SUBNET_2 ($AZ2)"

# ===================== 3. INTERNET GATEWAY ========================
echo ""
echo "📦 Step 3: Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-igw}]" \
    --region $AWS_REGION --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID --region $AWS_REGION
echo "   Internet Gateway: $IGW_ID (attached to VPC)"

# ===================== 4. ROUTE TABLE ========================
echo ""
echo "📦 Step 4: Creating Route Table..."
RTB_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-rt}]" \
    --region $AWS_REGION --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RTB_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID --region $AWS_REGION > /dev/null
aws ec2 associate-route-table --route-table-id $RTB_ID --subnet-id $PUBLIC_SUBNET_1 --region $AWS_REGION > /dev/null
aws ec2 associate-route-table --route-table-id $RTB_ID --subnet-id $PUBLIC_SUBNET_2 --region $AWS_REGION > /dev/null
echo "   Route Table: $RTB_ID (0.0.0.0/0 → IGW)"

# Enable auto-assign public IPs
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_1 --map-public-ip-on-launch --region $AWS_REGION
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_2 --map-public-ip-on-launch --region $AWS_REGION

# ===================== 5. SECURITY GROUPS ========================
echo ""
echo "📦 Step 5: Creating Security Groups..."

# EC2 Security Group
EC2_SG=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-ec2-sg" \
    --description "GearFlow EC2 Security Group" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION --query 'GroupId' --output text)
# Allow SSH (restrict to your IP in production!)
aws ec2 authorize-security-group-ingress --group-id $EC2_SG --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION > /dev/null
# Allow HTTP
aws ec2 authorize-security-group-ingress --group-id $EC2_SG --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION > /dev/null
# Allow HTTPS
aws ec2 authorize-security-group-ingress --group-id $EC2_SG --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION > /dev/null
# Allow backend port
aws ec2 authorize-security-group-ingress --group-id $EC2_SG --protocol tcp --port 8080 --cidr 0.0.0.0/0 --region $AWS_REGION > /dev/null
echo "   EC2 SG: $EC2_SG (SSH:22, HTTP:80, HTTPS:443, App:8080)"

# RDS Security Group
RDS_SG=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-rds-sg" \
    --description "GearFlow RDS Security Group" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION --query 'GroupId' --output text)
# Allow MySQL from EC2 security group only
aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 3306 --source-group $EC2_SG --region $AWS_REGION > /dev/null
echo "   RDS SG: $RDS_SG (MySQL:3306 from EC2 SG only)"

# ===================== 6. ECR REPOSITORIES ========================
echo ""
echo "📦 Step 6: Creating ECR Repositories..."
aws ecr create-repository --repository-name ${PROJECT_NAME}-backend --region $AWS_REGION --image-scanning-configuration scanOnPush=true > /dev/null 2>&1 || echo "   Backend repo already exists"
aws ecr create-repository --repository-name ${PROJECT_NAME}-frontend --region $AWS_REGION --image-scanning-configuration scanOnPush=true > /dev/null 2>&1 || echo "   Frontend repo already exists"
echo "   ECR repos: ${PROJECT_NAME}-backend, ${PROJECT_NAME}-frontend"

# ===================== 7. RDS MYSQL ========================
echo ""
echo "📦 Step 7: Creating RDS MySQL Instance (this takes 5-10 minutes)..."

# Create DB Subnet Group
aws rds create-db-subnet-group \
    --db-subnet-group-name "${PROJECT_NAME}-db-subnet" \
    --db-subnet-group-description "GearFlow DB Subnet Group" \
    --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 \
    --region $AWS_REGION > /dev/null

RDS_INSTANCE=$(aws rds create-db-instance \
    --db-instance-identifier "${PROJECT_NAME}-db" \
    --db-instance-class $RDS_INSTANCE_CLASS \
    --engine mysql \
    --engine-version "8.0" \
    --master-username $RDS_MASTER_USER \
    --master-user-password "$RDS_MASTER_PASSWORD" \
    --allocated-storage 20 \
    --max-allocated-storage 100 \
    --storage-type gp3 \
    --db-name $RDS_DB_NAME \
    --vpc-security-group-ids $RDS_SG \
    --db-subnet-group-name "${PROJECT_NAME}-db-subnet" \
    --no-publicly-accessible \
    --backup-retention-period 7 \
    --multi-az false \
    --auto-minor-version-upgrade \
    --storage-encrypted \
    --tags "Key=Project,Value=${PROJECT_NAME}" \
    --region $AWS_REGION \
    --query 'DBInstance.DBInstanceIdentifier' --output text)
echo "   RDS Instance: $RDS_INSTANCE (waiting for availability...)"

# ===================== 8. IAM ROLE FOR EC2 ========================
echo ""
echo "📦 Step 8: Creating IAM Role for EC2..."

# Create trust policy
cat > /tmp/ec2-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name "${PROJECT_NAME}-ec2-role" \
    --assume-role-policy-document file:///tmp/ec2-trust-policy.json > /dev/null 2>&1 || echo "   Role already exists"

# Attach policies: ECR read, CloudWatch Logs, SSM
aws iam attach-role-policy --role-name "${PROJECT_NAME}-ec2-role" \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly 2>/dev/null || true
aws iam attach-role-policy --role-name "${PROJECT_NAME}-ec2-role" \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess 2>/dev/null || true
aws iam attach-role-policy --role-name "${PROJECT_NAME}-ec2-role" \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore 2>/dev/null || true

# Create instance profile
aws iam create-instance-profile --instance-profile-name "${PROJECT_NAME}-ec2-profile" > /dev/null 2>&1 || true
aws iam add-role-to-instance-profile --instance-profile-name "${PROJECT_NAME}-ec2-profile" --role-name "${PROJECT_NAME}-ec2-role" 2>/dev/null || true
echo "   IAM Role: ${PROJECT_NAME}-ec2-role (ECR + CloudWatch + SSM)"

# Wait for instance profile to propagate
sleep 10

# ===================== 9. CLOUDWATCH LOG GROUPS ========================
echo ""
echo "📦 Step 9: Creating CloudWatch Log Groups..."
aws logs create-log-group --log-group-name /gearflow/backend --region $AWS_REGION 2>/dev/null || true
aws logs create-log-group --log-group-name /gearflow/frontend --region $AWS_REGION 2>/dev/null || true
aws logs put-retention-policy --log-group-name /gearflow/backend --retention-in-days 30 --region $AWS_REGION
aws logs put-retention-policy --log-group-name /gearflow/frontend --retention-in-days 30 --region $AWS_REGION
echo "   Log groups created with 30-day retention"

# ===================== 10. EC2 INSTANCE ========================
echo ""
echo "📦 Step 10: Launching EC2 Instance..."

# User data script to install Docker
USER_DATA=$(cat << 'USERDATA'
#!/bin/bash
set -e

# Update system
apt-get update -y && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
apt-get install -y unzip
unzip awscliv2.zip
./aws/install

# Create project directory
mkdir -p /home/ubuntu/gearflow
chown ubuntu:ubuntu /home/ubuntu/gearflow

# Enable Docker service
systemctl enable docker
systemctl start docker

echo "✅ EC2 setup complete!"
USERDATA
)

EC2_INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $EC2_AMI \
    --instance-type $EC2_INSTANCE_TYPE \
    --key-name $EC2_KEY_NAME \
    --security-group-ids $EC2_SG \
    --subnet-id $PUBLIC_SUBNET_1 \
    --iam-instance-profile Name="${PROJECT_NAME}-ec2-profile" \
    --user-data "$USER_DATA" \
    --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":30,\"VolumeType\":\"gp3\"}}]" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${PROJECT_NAME}-server},{Key=Project,Value=${PROJECT_NAME}}]" \
    --region $AWS_REGION \
    --query 'Instances[0].InstanceId' --output text)
echo "   EC2 Instance: $EC2_INSTANCE_ID"

# Wait for EC2 to be running
echo "   Waiting for EC2 instance to start..."
aws ec2 wait instance-running --instance-ids $EC2_INSTANCE_ID --region $AWS_REGION

# Get public IP
EC2_PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $EC2_INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text --region $AWS_REGION)
echo "   EC2 Public IP: $EC2_PUBLIC_IP"

# ===================== WAIT FOR RDS ========================
echo ""
echo "⏳ Waiting for RDS to become available (this may take 5-10 minutes)..."
aws rds wait db-instance-available --db-instance-identifier "${PROJECT_NAME}-db" --region $AWS_REGION

RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "${PROJECT_NAME}-db" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text --region $AWS_REGION)
echo "   RDS Endpoint: $RDS_ENDPOINT"

# ===================== GET AWS ACCOUNT ID ========================
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# ===================== SUMMARY ========================
echo ""
echo "============================================"
echo "  ✅ GearFlow Infrastructure Created!"
echo "============================================"
echo ""
echo "  VPC:              $VPC_ID"
echo "  EC2 Instance:     $EC2_INSTANCE_ID"
echo "  EC2 Public IP:    $EC2_PUBLIC_IP"
echo "  RDS Endpoint:     $RDS_ENDPOINT"
echo "  ECR Backend:      ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-backend"
echo "  ECR Frontend:     ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-frontend"
echo "  EC2 SG:           $EC2_SG"
echo "  RDS SG:           $RDS_SG"
echo ""
echo "  📋 Next Steps:"
echo "  1. SSH into EC2:  ssh -i ${EC2_KEY_NAME}.pem ubuntu@${EC2_PUBLIC_IP}"
echo "  2. Copy .env and docker-compose.prod.yml to EC2"
echo "  3. Run the deploy script: ./deploy.sh"
echo ""
echo "  🔑 Save these credentials for .env file:"
echo "  AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}"
echo "  AWS_REGION=${AWS_REGION}"
echo "  RDS_ENDPOINT=${RDS_ENDPOINT}"
echo "  DB_NAME=${RDS_DB_NAME}"
echo "  DB_USER=${RDS_MASTER_USER}"
echo "  DB_PASSWORD=${RDS_MASTER_PASSWORD}"
echo "============================================"

# Save output to file
cat > /tmp/gearflow-infra-output.txt << EOF
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
AWS_REGION=${AWS_REGION}
VPC_ID=${VPC_ID}
EC2_INSTANCE_ID=${EC2_INSTANCE_ID}
EC2_PUBLIC_IP=${EC2_PUBLIC_IP}
EC2_SG=${EC2_SG}
RDS_SG=${RDS_SG}
RDS_ENDPOINT=${RDS_ENDPOINT}
RDS_DB_NAME=${RDS_DB_NAME}
RDS_MASTER_USER=${RDS_MASTER_USER}
PUBLIC_SUBNET_1=${PUBLIC_SUBNET_1}
PUBLIC_SUBNET_2=${PUBLIC_SUBNET_2}
PRIVATE_SUBNET_1=${PRIVATE_SUBNET_1}
PRIVATE_SUBNET_2=${PRIVATE_SUBNET_2}
EOF
echo ""
echo "📄 Output saved to /tmp/gearflow-infra-output.txt"
