# main.tf

resource "aws_db_subnet_group" "rds" {
  name       = "rds-subnet-group"
  subnet_ids = var.subnet_ids

  tags = { Name = "RDS subnet group" }
}

resource "aws_db_instance" "database" {
  allocated_storage    = var.db_allocated_storage
  db_name              = var.db_name
  engine               = var.db_engine
  # engine_version       = var.db_engine_version
  instance_class       = var.db_instance_class
  username             = var.db_username
  password             = var.db_password
  # identifier           = var.db_instance_identifier
  storage_type         = var.db_storage_type
  publicly_accessible  = var.db_publicly_accessible
  skip_final_snapshot  = var.skip_final_snapshot

  db_subnet_group_name    = aws_db_subnet_group.rds.name
  vpc_security_group_ids  = var.vpc_security_group_ids

  tags = {
    Project = var.project_name
    Environment = var.environment
    Name = var.db_name
  }
}