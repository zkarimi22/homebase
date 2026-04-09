variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name used for resource naming"
  type        = string
  default     = "homebase"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "domain_name" {
  description = "Domain name for the application (optional, leave empty to skip Route53/ACM)"
  type        = string
  default     = ""
}

variable "ses_email_address" {
  description = "Email address for Cognito to send verification/password-reset emails from. Must be verified in SES."
  type        = string
}
