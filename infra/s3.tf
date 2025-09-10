########################################
# S3 Bucket for React SPA Hosting
# - Stores built frontend files (index.html, JS, CSS, etc.)
# - Random suffix ensures unique bucket name
########################################
resource "aws_s3_bucket" "cvault" {
  bucket        = "cvault-spa-${random_id.bucket_suffix.hex}"
  force_destroy = true # Allow deletion even if files exist (dev convenience)

  tags = {
    Name = "CVault SPA Hosting"
    Env  = "dev"
  }
}

########################################
# Block All Public Access
# - Ensures bucket is not directly accessible
# - CloudFront Origin Access Control (OAC) is used instead
########################################
resource "aws_s3_bucket_public_access_block" "cvault" {
  bucket                  = aws_s3_bucket.cvault.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

########################################
# Website Configuration
# - SPA requires all routes to serve index.html
# - Handles 404 → index.html (client-side routing)
########################################
resource "aws_s3_bucket_website_configuration" "cvault" {
  bucket = aws_s3_bucket.cvault.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

########################################
# Bucket Policy
# - Allows CloudFront to read objects from this bucket
# - Restricted by CloudFront distribution ARN
########################################
resource "aws_s3_bucket_policy" "cvault" {
  bucket = aws_s3_bucket.cvault.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = {
          Service = "cloudfront.amazonaws.com"
        },
        Action   = "s3:GetObject",
        Resource = "${aws_s3_bucket.cvault.arn}/*",
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.cvault.arn
          }
        }
      }
    ]
  })
}
