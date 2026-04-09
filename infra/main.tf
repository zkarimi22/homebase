terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  prefix = "${var.project}-${var.environment}"
}

# ── Cognito ──────────────────────────────────────────────────
module "cognito" {
  source            = "./modules/cognito"
  prefix            = local.prefix
  environment       = var.environment
  ses_email_address = var.ses_email_address
}

# ── S3 Buckets ───────────────────────────────────────────────
module "s3" {
  source = "./modules/s3"
  prefix = local.prefix
}

# ── Lambda Functions ─────────────────────────────────────────
module "lambda" {
  source     = "./modules/lambda"
  prefix     = local.prefix
  aws_region = var.aws_region

  cognito_user_pool_id = module.cognito.user_pool_id
  documents_bucket_arn = module.s3.documents_bucket_arn
  documents_bucket_id  = module.s3.documents_bucket_id
}

# ── DynamoDB ─────────────────────────────────────────────────
module "dynamodb" {
  source = "./modules/dynamodb"
  prefix = local.prefix
}

# ── API Gateway ──────────────────────────────────────────────
module "api_gateway" {
  source = "./modules/api-gateway"
  prefix = local.prefix

  cognito_user_pool_id       = module.cognito.user_pool_id
  cognito_user_pool_endpoint = module.cognito.user_pool_endpoint
  cognito_app_client_id      = module.cognito.app_client_id

  lambda_functions = module.lambda.function_invoke_arns
  lambda_arns      = module.lambda.function_arns
}
