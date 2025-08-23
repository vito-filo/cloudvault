# rds/outputs.tf

output "rds_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = aws_db_instance.database.endpoint
}

output "rds_db_name" {
  description = "The name of the RDS database"
  value       = aws_db_instance.database.db_name
}

output "rds_db_username" {
  description = "The name of the RDS database"
  value       = aws_db_instance.database.username
}
