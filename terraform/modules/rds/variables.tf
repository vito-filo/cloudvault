# variables.tf

variable "db_allocated_storage" {
  description = "Allocated storage in gibibytes"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Name of the initial database on the DB instance"
  type        = string
}

variable "db_engine" {
  description = "Database engine type"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "5.7"
}

variable "db_instance_class" {
  description = "Instance class of the RDS instance"
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "Username for the master DB user"
  type        = string
}

variable "db_password" {
  description = "Password for the master DB user"
  type        = string
  sensitive   = true
}

variable "db_storage_type" {
  description = "Storage type for the DB instance"
  type        = string
  default     = "gp2"
}

variable "db_publicly_accessible" {
  description = "Specifies whether the DB instance is publicly accessible"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
    description = "Final DB snapshot is created before instance is deleted."
    type        = string
    default     = true 
}

variable "vpc_security_group_ids" {
  description = "List of VPC security group IDs to associate with the DB instance"
  type        = list(string)
}

variable "subnet_ids" {
  type = list(string)
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment for the project (e.g., dev, prod)"
  type        = string
}


