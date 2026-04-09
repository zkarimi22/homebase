output "documents_bucket_id" {
  value = aws_s3_bucket.documents.id
}

output "documents_bucket_arn" {
  value = aws_s3_bucket.documents.arn
}

output "frontend_bucket_id" {
  value = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  value = aws_s3_bucket.frontend.arn
}
