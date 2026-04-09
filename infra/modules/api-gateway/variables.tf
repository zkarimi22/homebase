variable "prefix" {
  type = string
}

variable "cognito_user_pool_id" {
  type = string
}

variable "cognito_user_pool_endpoint" {
  type = string
}

variable "cognito_app_client_id" {
  type = string
}

variable "lambda_functions" {
  description = "Map of function name to invoke ARN"
  type        = map(string)
}

variable "lambda_arns" {
  description = "Map of function name to ARN"
  type        = map(string)
}
