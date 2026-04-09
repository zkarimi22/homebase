output "documents_table_name" {
  value = aws_dynamodb_table.documents.name
}

output "documents_table_arn" {
  value = aws_dynamodb_table.documents.arn
}

output "projects_table_name" {
  value = aws_dynamodb_table.projects.name
}

output "projects_table_arn" {
  value = aws_dynamodb_table.projects.arn
}
