# main.tf

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
  project_name = var.project_name
  environment  = var.environment
}

## Postgres DB
module "rds" {
  source = "./modules/rds"

  project_name           = var.project_name
  environment            = var.environment
  
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password

  subnet_ids             = module.vpc.subnet_ids
  vpc_security_group_ids = [module.vpc.rds_security_group_id]
}


## DynamoDB table for caching
resource "aws_dynamodb_table" "registration_table" {
  name           = "Registration"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"

  attribute {
    name = "email"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }

  tags = {
    Name        = "dynamodb-registration-table"
    Project     = var.project_name
    Environment = var.environment
  }
}

module "lambda"{
  source = "./modules/lambda"
  project_name = var.project_name
  environment  = var.environment

  dynamo_table_arn = aws_dynamodb_table.registration_table.arn

  rds_url = module.rds.rds_endpoint
  rds_db_name = module.rds.rds_db_name
  rds_db_username = module.rds.rds_db_username
  rds_db_password = var.db_password

  AES_KEY = var.aes_key
  JWT_SECRET = var.jwt_secret

  allow_origins = var.allow_origins
  rp_name = var.rp_name
  rp_id = var.rp_id
  rp_origin = var.rp_origin

  depends_on = [ module.rds, aws_dynamodb_table.registration_table ]
}

module "apigateway" {
  source = "./modules/apiGateway"
  project_name = var.project_name
  environment  = var.environment

  lambda_arn = module.lambda.lambda_arn

  depends_on = [ module.lambda ]
}

## Deploy frontend
module "amplify" {
  source = "./modules/amplify"
  project_name = var.project_name
  environment  = var.environment

  github_frontend_url = var.github_frontend_url
  github_access_token = var.github_access_token
  api_url             = module.apigateway.api_gateway_url

  depends_on = [ module.apigateway ]
}