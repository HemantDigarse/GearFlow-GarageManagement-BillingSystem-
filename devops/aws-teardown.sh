#!/bin/bash
# ============================================================
# GearFlow - Teardown AWS Infrastructure
# ============================================================
# WARNING: This will DELETE all AWS resources!
# Only use this to clean up / avoid charges.
#
# Usage: chmod +x aws-teardown.sh && ./aws-teardown.sh
# ============================================================

set -euo pipefail

PROJECT_NAME="gearflow"
AWS_REGION="ap-south-1"

echo "============================================"
echo "  ⚠️  GearFlow - AWS Teardown"
echo "  This will DELETE all resources!"
echo "============================================"
read -p "Are you sure? Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🗑️  Terminating EC2 instance..."
EC2_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Project,Values=${PROJECT_NAME}" "Name=instance-state-name,Values=running,stopped" \
    --query 'Reservations[*].Instances[*].InstanceId' --output text --region $AWS_REGION 2>/dev/null || true)
if [ -n "$EC2_ID" ]; then
    aws ec2 terminate-instances --instance-ids $EC2_ID --region $AWS_REGION > /dev/null
    echo "   Waiting for termination..."
    aws ec2 wait instance-terminated --instance-ids $EC2_ID --region $AWS_REGION
    echo "   ✅ EC2 terminated: $EC2_ID"
fi

echo ""
echo "🗑️  Deleting RDS instance..."
aws rds delete-db-instance \
    --db-instance-identifier "${PROJECT_NAME}-db" \
    --skip-final-snapshot \
    --delete-automated-backups \
    --region $AWS_REGION > /dev/null 2>&1 || echo "   RDS not found or already deleting"
echo "   Waiting for RDS deletion (this takes a few minutes)..."
aws rds wait db-instance-deleted --db-instance-identifier "${PROJECT_NAME}-db" --region $AWS_REGION 2>/dev/null || true
echo "   ✅ RDS deleted"

echo ""
echo "🗑️  Deleting DB Subnet Group..."
aws rds delete-db-subnet-group --db-subnet-group-name "${PROJECT_NAME}-db-subnet" --region $AWS_REGION 2>/dev/null || true
echo "   ✅ DB Subnet Group deleted"

echo ""
echo "🗑️  Deleting ECR repositories..."
aws ecr delete-repository --repository-name ${PROJECT_NAME}-backend --force --region $AWS_REGION 2>/dev/null || true
aws ecr delete-repository --repository-name ${PROJECT_NAME}-frontend --force --region $AWS_REGION 2>/dev/null || true
echo "   ✅ ECR repos deleted"

echo ""
echo "🗑️  Deleting CloudWatch Log Groups..."
aws logs delete-log-group --log-group-name /gearflow/backend --region $AWS_REGION 2>/dev/null || true
aws logs delete-log-group --log-group-name /gearflow/frontend --region $AWS_REGION 2>/dev/null || true
echo "   ✅ Log groups deleted"

echo ""
echo "🗑️  Cleaning up IAM..."
aws iam remove-role-from-instance-profile --instance-profile-name "${PROJECT_NAME}-ec2-profile" --role-name "${PROJECT_NAME}-ec2-role" 2>/dev/null || true
aws iam delete-instance-profile --instance-profile-name "${PROJECT_NAME}-ec2-profile" 2>/dev/null || true
aws iam detach-role-policy --role-name "${PROJECT_NAME}-ec2-role" --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly 2>/dev/null || true
aws iam detach-role-policy --role-name "${PROJECT_NAME}-ec2-role" --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess 2>/dev/null || true
aws iam detach-role-policy --role-name "${PROJECT_NAME}-ec2-role" --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore 2>/dev/null || true
aws iam delete-role --role-name "${PROJECT_NAME}-ec2-role" 2>/dev/null || true
echo "   ✅ IAM cleaned up"

echo ""
echo "🗑️  Deleting VPC resources..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Project,Values=${PROJECT_NAME}" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION 2>/dev/null || true)
if [ -n "$VPC_ID" ] && [ "$VPC_ID" != "None" ]; then
    # Delete security groups (non-default)
    for SG in $(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text --region $AWS_REGION); do
        aws ec2 delete-security-group --group-id $SG --region $AWS_REGION 2>/dev/null || true
    done

    # Detach and delete internet gateway
    for IGW in $(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query 'InternetGateways[*].InternetGatewayId' --output text --region $AWS_REGION); do
        aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC_ID --region $AWS_REGION
        aws ec2 delete-internet-gateway --internet-gateway-id $IGW --region $AWS_REGION
    done

    # Delete subnets
    for SUBNET in $(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[*].SubnetId' --output text --region $AWS_REGION); do
        aws ec2 delete-subnet --subnet-id $SUBNET --region $AWS_REGION 2>/dev/null || true
    done

    # Delete route tables (non-main)
    for RTB in $(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text --region $AWS_REGION); do
        # Disassociate first
        for ASSOC in $(aws ec2 describe-route-tables --route-table-ids $RTB --query 'RouteTables[*].Associations[?!Main].RouteTableAssociationId' --output text --region $AWS_REGION); do
            aws ec2 disassociate-route-table --association-id $ASSOC --region $AWS_REGION 2>/dev/null || true
        done
        aws ec2 delete-route-table --route-table-id $RTB --region $AWS_REGION 2>/dev/null || true
    done

    # Delete VPC
    aws ec2 delete-vpc --vpc-id $VPC_ID --region $AWS_REGION
    echo "   ✅ VPC deleted: $VPC_ID"
else
    echo "   No VPC found"
fi

echo ""
echo "============================================"
echo "  ✅ All GearFlow AWS resources deleted!"
echo "============================================"
