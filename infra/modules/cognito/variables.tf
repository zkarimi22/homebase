variable "prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "ses_email_address" {
  description = "Verified SES email address for Cognito to send from"
  type        = string
}
