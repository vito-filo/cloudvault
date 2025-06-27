variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment for the project (e.g., dev, prod)"
  type        = string
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}