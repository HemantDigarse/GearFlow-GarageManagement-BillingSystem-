# ============================================================
# GearFlow - Terraform Outputs
# ============================================================

output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.gearflow.public_ip
}

output "ec2_instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.gearflow.id
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = aws_db_instance.gearflow.endpoint
}

output "rds_hostname" {
  description = "RDS MySQL hostname (without port)"
  value       = aws_db_instance.gearflow.address
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "aws_account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.gearflow.id
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.gearflow.public_ip}"
}

# ---- Generate Ansible Inventory ----
output "ansible_inventory" {
  description = "Ansible inventory content"
  value       = <<-EOT
    [gearflow]
    ${aws_instance.gearflow.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/gearflow-key.pem
    
    [gearflow:vars]
    rds_endpoint=${aws_db_instance.gearflow.address}
    db_name=${var.db_name}
    db_username=${var.db_username}
    ecr_backend_url=${aws_ecr_repository.backend.repository_url}
    ecr_frontend_url=${aws_ecr_repository.frontend.repository_url}
    aws_region=${var.aws_region}
    aws_account_id=${data.aws_caller_identity.current.account_id}
  EOT
}

# ---- Generate .env for Docker Compose ----
output "docker_env_file" {
  description = "Content for the .env file on EC2"
  sensitive   = true
  value       = <<-EOT
    DB_NAME=${var.db_name}
    DB_USER=${var.db_username}
    DB_PASSWORD=${var.db_password}
    RDS_ENDPOINT=${aws_db_instance.gearflow.address}
    JWT_SECRET=${var.jwt_secret}
    JWT_EXPIRATION=86400000
    AWS_ACCOUNT_ID=${data.aws_caller_identity.current.account_id}
    AWS_REGION=${var.aws_region}
    IMAGE_TAG=latest
  EOT
}

# ---- SSH Command ----
output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ~/.ssh/gearflow-key.pem ubuntu@${aws_instance.gearflow.public_ip}"
}
