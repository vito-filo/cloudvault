variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment for the project (e.g., dev, staging, prod)"
  type        = string
}

variable "lambda_arn" {
  description = "URI of the Lambda function to integrate with API Gateway"
  type        = string
}

# variable "allow_origins" {
#   description = "List of allowed origins for CORS"
#   type        = string
# }

variable "rp_origin" {
  description = "Origin URL for the Relying Party (RP) for Webauthn"
  type        = string
}