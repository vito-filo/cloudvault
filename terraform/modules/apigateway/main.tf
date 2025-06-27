resource "aws_apigatewayv2_api" "http_api" {
  name          = "api-${var.project_name}-${var.environment}"
  protocol_type = "HTTP"
  cors_configuration {
    allow_headers = ["Authorization", "Content-Type"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_origins = [] ## Amplify url / Domain name
    expose_headers = []
    max_age        = 3600
    allow_credentials = true
  }
  tags = {
    Name        = "api-${var.project_name}-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}


resource "aws_apigatewayv2_route" "proxy_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
  tags = {
    Name        = "default-stage-${var.project_name}-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}