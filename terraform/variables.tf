# ============================================================
# GearFlow - Terraform Variables
# ============================================================

variable "aws_region" {
  description = "AWS region to deploy GearFlow."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
  default     = "gearflow"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "production"
}

# ---- Networking ----
variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.40.1.0/24", "10.40.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (for RDS)."
  type        = list(string)
  default     = ["10.40.10.0/24", "10.40.11.0/24"]
}

variable "admin_cidr" {
  description = "Your public IP CIDR for SSH access, e.g. 203.0.113.10/32. Use 0.0.0.0/0 for unrestricted (not recommended)."
  type        = string
}

# ---- EC2 ----
variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.small"
}

variable "ssh_public_key" {
  description = "SSH public key content for EC2 access. Run: cat ~/.ssh/id_rsa.pub"
  type        = string
}

variable "root_volume_size" {
  description = "Root volume size in GB."
  type        = number
  default     = 30
}

# ---- RDS ----
variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name."
  type        = string
  default     = "gearflow"
}

variable "db_username" {
  description = "Database master username."
  type        = string
  default     = "gearflow_admin"
}

variable "db_password" {
  description = "Database master password. Use a strong password!"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB."
  type        = number
  default     = 20
}

# ---- Application ----
variable "jwt_secret" {
  description = "JWT secret key for Spring Boot (min 256 bits / 32 chars)."
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for the application (optional, leave empty for IP-based access)."
  type        = string
  default     = ""
}
