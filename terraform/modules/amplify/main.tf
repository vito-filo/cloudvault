resource "aws_amplify_app" "frontend" {
  name       = "AmplifyApp-${var.project_name}"
  repository = var.github_frontend_url
  access_token = var.github_access_token

  environment_variables = {
    EXPO_PUBLIC_API_URL = var.api_url
  }

  tags = {
    Name        = "Amplify-${var.project_name}-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_amplify_branch" "master" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "master"

  enable_auto_build = true
  stage             = "PRODUCTION"
  tags = {
    Name        = "AmplifyBranch-${var.project_name}-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}