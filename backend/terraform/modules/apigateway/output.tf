output "api_gateway_url" {
  description = "The URL of the API Gateway"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}"
}