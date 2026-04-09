output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_app_client_id" {
  description = "Cognito App Client ID"
  value       = module.cognito.app_client_id
}

output "cognito_user_pool_endpoint" {
  description = "Cognito User Pool endpoint for auth"
  value       = module.cognito.user_pool_endpoint
}

output "api_gateway_url" {
  description = "API Gateway base URL"
  value       = module.api_gateway.api_url
}

output "documents_bucket" {
  description = "S3 bucket for document storage"
  value       = module.s3.documents_bucket_id
}
