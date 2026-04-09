resource "aws_apigatewayv2_api" "main" {
  name          = "${var.prefix}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Correlation-Id"]
    max_age       = 3600
  }
}

# Cognito JWT Authorizer
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.prefix}-cognito-auth"

  jwt_configuration {
    audience = [var.cognito_app_client_id]
    issuer   = "https://${var.cognito_user_pool_endpoint}"
  }
}

# ── Routes ───────────────────────────────────────────────────
locals {
  routes = {
    # Identity
    "GET /api/identity/profile"    = "identity-get-profile"
    "GET /api/identity/households" = "identity-get-households"

    # Property
    "GET /api/property/dashboard" = "property-get-dashboard"
    "GET /api/property/summary"   = "property-get-summary"

    # Documents
    "GET /api/documents"              = "documents-list"
    "POST /api/documents/upload-url"  = "documents-create-upload-url"
    "POST /api/documents/download-url" = "documents-create-download-url"

    # Finances
    "GET /api/finances/summary"     = "finances-get-summary"
    "GET /api/finances/obligations" = "finances-get-obligations"

    # Maintenance
    "GET /api/maintenance/tasks"     = "maintenance-get-tasks"
    "GET /api/maintenance/reminders" = "maintenance-get-reminders"

    # Projects
    "GET /api/projects"          = "projects-list"
    "GET /api/projects/{id}"     = "projects-get-detail"

    # Vendors
    "GET /api/vendors" = "vendors-list"

    # Neighborhood
    "GET /api/neighborhood/feed" = "neighborhood-get-feed"

    # Notifications
    "GET /api/notifications/preferences" = "notifications-get-preferences"
  }
}

resource "aws_apigatewayv2_integration" "lambdas" {
  for_each = local.routes

  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_functions[each.value]
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "routes" {
  for_each = local.routes

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.key

  target             = "integrations/${aws_apigatewayv2_integration.lambdas[each.key].id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Lambda permissions for API Gateway invocation
resource "aws_lambda_permission" "api_gw" {
  for_each = local.routes

  statement_id  = "AllowAPIGW-${replace(replace(replace(replace(each.key, " ", "-"), "/", "_"), "{", ""), "}", "")}"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_arns[each.value]
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Default stage with auto-deploy
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/apigateway/${var.prefix}-api"
  retention_in_days = 14
}
