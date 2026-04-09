output "function_invoke_arns" {
  description = "Map of function name to invoke ARN"
  value = {
    for k, v in aws_lambda_function.services : k => v.invoke_arn
  }
}

output "function_arns" {
  description = "Map of function name to ARN"
  value = {
    for k, v in aws_lambda_function.services : k => v.arn
  }
}
