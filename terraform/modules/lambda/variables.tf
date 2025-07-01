variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "region" {
  description = "AWS region where the Lambda function will be deployed"
  type        = string
  default     = "eu-central-1" 
}

variable "AES_KEY" {
  description = "AES encryption key for the Lambda function"
  type        = string
  sensitive = true
}

variable "JWT_SECRET" {
  description = "JWT secret key for the Lambda function"
  type        = string
  sensitive   = true
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
  description = "Environment for the project (e.g., dev, staging, prod)"
  type        = string
}

variable "dynamo_table_arn" {
  description = "ARN of the DynamoDB table for registration"
  type        = string
}

variable "rds_url" {
  description = "RDS endpoint for the Lambda function to connect to"
  type        = string
}

variable "rds_db_name" {
  description = "Name of the RDS database"
  type        = string
  default     = "postgres"
}

variable "rds_db_username" {
  description = "Username for the RDS database"
  type        = string
  default     = "admin"
}

variable "rds_db_password" {
  description = "Password for the RDS database"
  type        = string
  sensitive   = true
}