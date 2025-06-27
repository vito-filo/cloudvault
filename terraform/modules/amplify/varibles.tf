variable "github_frontend_url" {
    description = "GitHub repository URL for the Frontend app"
    type        = string
}

variable "github_access_token" {
    description = "GitHub access token to fetch the Frontend repository"
    type        = string
    sensitive   = true
}

variable "api_url" {
    description = "API URL for the backend service"
    type        = string
}

variable "project_name" {
    description = "Name of the project"
    type        = string
    default     = "Cloud-Vault-DEV"
}

variable "environment" {
    description = "Environment for the project (e.g., dev, prod)"
    type        = string
    default     = "dev"
}
