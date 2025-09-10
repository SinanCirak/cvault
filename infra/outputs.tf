########################################
# Outputs
# - Useful for referencing in CI/CD pipelines or documentation
########################################

# Static site hosting bucket (React SPA)
output "s3_bucket_name" {
  value = aws_s3_bucket.cvault.bucket
}

# File uploads bucket (user files)
output "uploads_bucket_name" {
  value = aws_s3_bucket.cvault_uploads.bucket
}

# CloudFront distribution domain
# - Use this for accessing the hosted SPA before custom domain setup
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.cvault.domain_name
}

# API Gateway base invoke URL (dev stage)
# - Used by frontend for file operations
output "api_gateway_url" {
  description = "Invoke URL for the API Gateway"
  value       = "https://${aws_api_gateway_rest_api.cvault.id}.execute-api.${var.aws_region}.amazonaws.com/dev/files"
}
