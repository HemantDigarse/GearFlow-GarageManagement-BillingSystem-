variable "aws_region" {
  description = "AWS region for the GearFlow host."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "gearflow"
}

variable "vpc_cidr" {
  type    = string
  default = "10.40.0.0/16"
}

variable "subnet_cidr" {
  type    = string
  default = "10.40.1.0/24"
}

variable "admin_cidr" {
  description = "Your public IPv4 CIDR for SSH, for example 203.0.113.10/32."
  type        = string
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "ssh_public_key" {
  description = "Public SSH key content. Never put a private key in Terraform."
  type        = string
}
