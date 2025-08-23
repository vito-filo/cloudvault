output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "rds_db_name" {
  value = module.rds.rds_db_name
}

output "rds_db_username" {
  value = module.rds.rds_db_username
}

output "api_gateway_url" {
  value = module.apigateway.api_gateway_url 
}