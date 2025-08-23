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

variable "dns_name" {
  description = "DNS name for the CloudFront distribution"
  type        = string 
  default     = ""
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

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for CloudFront"
  type        = string
  default     = ""
}

variable "sns_email_source" {
  description = "Email address to use as the source for SNS notifications"
  type        = string
}