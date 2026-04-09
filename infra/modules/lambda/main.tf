data "aws_caller_identity" "current" {}

# ── IAM Role shared by all service Lambdas ───────────────────
resource "aws_iam_role" "lambda_exec" {
  name = "${var.prefix}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# S3 access for document service
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${var.prefix}-lambda-s3"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
      ]
      Resource = [
        var.documents_bucket_arn,
        "${var.documents_bucket_arn}/*",
      ]
    }]
  })
}

# X-Ray tracing
resource "aws_iam_role_policy_attachment" "lambda_xray" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

# ── Lambda function definitions ──────────────────────────────
locals {
  lambda_defaults = {
    runtime     = "nodejs20.x"
    handler     = "index.handler"
    timeout     = 10
    memory_size = 256
  }

  functions = {
    # Identity
    "identity-get-profile"    = { description = "Get user profile" }
    "identity-get-households" = { description = "Get user households" }

    # Property
    "property-get-dashboard" = { description = "Get dashboard context" }
    "property-get-summary"   = { description = "Get property summary" }

    # Documents
    "documents-list"               = { description = "List documents" }
    "documents-create-upload-url"  = { description = "Generate S3 signed upload URL" }
    "documents-create-download-url" = { description = "Generate S3 signed download URL" }

    # Finances
    "finances-get-summary"     = { description = "Get finance summary" }
    "finances-get-obligations" = { description = "Get financial obligations" }

    # Maintenance
    "maintenance-get-tasks"     = { description = "Get maintenance tasks" }
    "maintenance-get-reminders" = { description = "Get maintenance reminders" }

    # Projects
    "projects-list"       = { description = "List projects" }
    "projects-get-detail" = { description = "Get project detail" }

    # Vendors
    "vendors-list" = { description = "List vendors" }

    # Neighborhood
    "neighborhood-get-feed" = { description = "Get neighborhood feed" }

    # Notifications
    "notifications-get-preferences" = { description = "Get notification preferences" }
  }
}

# Placeholder zip for initial deployment
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = <<-JS
      exports.handler = async (event) => {
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message: "Placeholder — ${var.prefix}",
            path: event.rawPath || event.path,
            timestamp: new Date().toISOString(),
          }),
        };
      };
    JS
    filename = "index.js"
  }
}

resource "aws_lambda_function" "services" {
  for_each = local.functions

  function_name = "${var.prefix}-${each.key}"
  description   = each.value.description
  role          = aws_iam_role.lambda_exec.arn
  runtime       = local.lambda_defaults.runtime
  handler       = local.lambda_defaults.handler
  timeout       = local.lambda_defaults.timeout
  memory_size   = local.lambda_defaults.memory_size

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT        = "dev"
      AWS_REGION_NAME    = var.aws_region
      COGNITO_POOL_ID    = var.cognito_user_pool_id
      DOCUMENTS_BUCKET   = var.documents_bucket_id
    }
  }

  tracing_config {
    mode = "Active"
  }
}
