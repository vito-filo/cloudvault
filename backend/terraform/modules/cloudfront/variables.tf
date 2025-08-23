variable "bucket_domain_name" {
  description = "The domain name of the Frontend S3 bucket"
  type        = string
}

variable "bucket_id" {
  description = "The ID of the Frontend S3 bucket"
  type        = string
}

variable "bucket_arn" {
  description = "The ARN of the Frontend S3 bucket"
  type        = string  
}

variable "dns_name" {
  description = "The DNS name for the CloudFront distribution"
  type        = string
}

variable "api_gateway_url" {
  description = "The URL of the API Gateway"
  type        = string
}

variable "acm_certificate_arn" {
  description = "The ARN of the ACM certificate for CloudFront"
  type        = string
}

variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The environment for the project (e.g., dev, prod)"
  type        = string
}