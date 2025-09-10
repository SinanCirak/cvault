########################################
# S3 Bucket for User Uploads
# - Stores user files uploaded via Lambda/API Gateway
# - Random suffix ensures unique bucket name
########################################
resource "aws_s3_bucket" "cvault_uploads" {
  bucket        = "cvault-uploads-${random_id.bucket_suffix.hex}"
  force_destroy = true # Allow bucket to be destroyed even if not empty (dev use)

  tags = {
    Name = "CVault User Uploads"
    Env  = "dev"
  }
}

########################################
# Block All Public Access
# - Ensures uploads bucket is private
# - Only accessible via CloudFront/Lambda signed requests
########################################
resource "aws_s3_bucket_public_access_block" "cvault_uploads" {
  bucket                  = aws_s3_bucket.cvault_uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

########################################
# CORS Configuration
# - Required for browser-based uploads (PUT/POST)
# - Allows requests from any origin (*)
# - Exposes ETag header for integrity checks
########################################
resource "aws_s3_bucket_cors_configuration" "cvault_uploads_cors" {
  bucket = aws_s3_bucket.cvault_uploads.id

  cors_rule {
    allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    allowed_origins = ["*"]     
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
