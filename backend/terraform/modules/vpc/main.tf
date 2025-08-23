# VPC

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "Cloud-Vault-vpc"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Subnets
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name = "public-subnet-${count.index}"
  }
}

data "aws_availability_zones" "available" {}


# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name = "main-igw"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name = "public-route-table"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "rds-sg"
  description = "Allow DB access"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # NOTE: For production, restrict this!
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name        = "rds-security-group"
  }
}

# # DB Subnet Group
# resource "aws_db_subnet_group" "rds" {
#   name       = "rds-subnet-group"
#   subnet_ids = aws_subnet.public[*].id

#   tags = {
#     Project     = var.project_name
#     Environment = var.environment
#     Name = "RDS subnet group"
#   }
# }

# Optional: You can now use this setup to launch an RDS instance
# using aws_db_instance with subnet_group_name = aws_db_subnet_group.rds.name

