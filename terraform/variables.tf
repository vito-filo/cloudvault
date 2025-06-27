variable "aws_region" {
  description = "AWS region"
  type        = string
  default = "eu-central-1"
}

variable "db_name" {
  description = "Name of the database to create"
  type        = string
  default     = "vault"
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
  default     = "vaultadmin"
}

variable "db_password" {
  description = "Password for the master DB user (Must be > 8 characters)"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "Cloud-Vault-DEV"
}

variable "aes_key" {
  description = "AES encryption key for the Lambda function"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key for the Lambda function"
  type        = string
  sensitive   = true
}

variable "allow_origins" {
  description = "List of allowed origins for CORS"
  type        = string
}

variable "rp_name" {
  description = "Name of the Relying Party (RP) for Webauthn"
  type        = string
}

variable "rp_id" {
  description = "Relying Party ID for Webauthn"
  type        = string
}

variable "rp_origin" {
  description = "Origin URL for the Relying Party (RP) for Webauthn"
  type        = string
}

variable "environment" {
  description = "Environment for the project (e.g., dev, prod)"
  type        = string
  default     = "dev"  
}

variable "github_frontend_url" {
  description = "GitHub repository URL for the Frontend app"
  type        = string
}

variable "github_access_token" {
  description = "GitHub access token to fetch the Frontend repository"
  type        = string
  sensitive   = true
}