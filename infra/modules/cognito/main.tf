# ── SES Email Identity ───────────────────────────────────────
resource "aws_ses_email_identity" "sender" {
  email = var.ses_email_address
}

# IAM role for Cognito to send via SES
resource "aws_iam_role" "cognito_ses" {
  name = "${var.prefix}-cognito-ses"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "cognito-idp.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "cognito_ses" {
  name = "${var.prefix}-cognito-ses-send"
  role = aws_iam_role.cognito_ses.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = "*"
    }]
  })
}

# ── Cognito User Pool ────────────────────────────────────────
resource "aws_cognito_user_pool" "main" {
  name = "${var.prefix}-users"

  # Sign-in with email
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Use SES for all email (verification, password reset, etc.)
  email_configuration {
    email_sending_account  = "DEVELOPER"
    from_email_address     = "Homebase <${var.ses_email_address}>"
    source_arn             = aws_ses_email_identity.sender.arn
    reply_to_email_address = var.ses_email_address
  }

  # Verification message template
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your Homebase verification code"
    email_message        = "Welcome to Homebase. Your verification code is {####}"
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # Custom attributes for tenant scoping
  schema {
    name                = "household_id"
    attribute_data_type = "String"
    required            = false
    mutable             = true

    string_attribute_constraints {
      min_length = 0
      max_length = 64
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.prefix}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Token validity
  access_token_validity  = 1  # hours
  id_token_validity      = 1  # hours
  refresh_token_validity = 30 # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"

  # No client secret for SPA
  generate_secret = false
}

# Seed a default user for dev
resource "aws_cognito_user" "default" {
  count        = var.environment == "dev" ? 1 : 0
  user_pool_id = aws_cognito_user_pool.main.id
  username     = "admin@homebase.dev"

  attributes = {
    email          = "admin@homebase.dev"
    name           = "Alex Morgan"
    email_verified = true
  }

  temporary_password = "Homebase2026!"
}
