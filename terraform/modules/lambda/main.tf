resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role-${var.project_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
  tags = {
    Name        = "lambda-exec-role-${var.project_name}-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
  }
}

## Create IAM policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_access" {
  name = "lambda-dynamodb-access"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem"
        ],
        Resource = var.dynamo_table_arn
      }
    ]
  })
}

## Create IAM policy for Lambda to send SES emails
resource "aws_iam_role_policy" "lambda_ses_access" {
  name = "lambda-ses-access"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ],
        Resource = "*"
      }
    ]
  })
}


resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "backend" {
  function_name = "Lambda-${var.project_name}"
  filename      = "../.serverless/cloud-vault-backend.zip"
  source_code_hash = filebase64sha256("../.serverless/cloud-vault-backend.zip")
  handler       = "dist/main.handler"
  runtime       = "nodejs22.x"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 10
  environment {
    variables = {
      REGION = var.region
      AES_KEY = var.AES_KEY
      JWT_SECRET = var.JWT_SECRET
      DATABASE_URL = "postgresql://${var.rds_db_username}:${var.rds_db_password}@${var.rds_url}/${var.rds_db_name}"
      EMAIL_SOURCE = var.email_source

      RP_NAME = var.rp_name
      RP_ID = var.rp_id
      RP_ORIGIN = var.rp_origin
    }
  }
  tags = {
    Name        = "backend-lambda-${var.project_name}-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
  }
}