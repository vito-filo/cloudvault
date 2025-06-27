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