########################################
# CloudFront Origin Access Control (OAC)
# - Restricts direct S3 access, enforces CloudFront signed requests
########################################
resource "aws_cloudfront_origin_access_control" "cvault" {
  name                              = "cvault-oac"
  description                       = "Access control for cvault SPA bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

########################################
# CloudFront Distribution
# - Serves React SPA hosted in S3
# - Enforces HTTPS, custom domain, ACM certificate
########################################
resource "aws_cloudfront_distribution" "cvault" {
  origin {
    domain_name              = aws_s3_bucket.cvault.bucket_regional_domain_name
    origin_id                = "S3-cvault"
    origin_access_control_id = aws_cloudfront_origin_access_control.cvault.id
  }

  enabled             = true
  default_root_object = "index.html"

  # Custom domain (must match ACM cert)
  aliases = [var.domain_name]

  ########################################
  # Default Cache Behavior
  # - GET/HEAD only (SPA static files)
  # - Redirect HTTP → HTTPS
  ########################################
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-cvault"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  ########################################
  # Restrictions (Geo-blocking)
  # - None (available globally)
  ########################################
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  ########################################
  # TLS / SSL Certificate (ACM in us-east-1)
  ########################################
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cvault_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "CVault CloudFront"
  }
}
