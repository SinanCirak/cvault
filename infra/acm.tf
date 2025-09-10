########################################
# Provider (us-east-1 required for ACM with CloudFront)
########################################
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

########################################
# Step 1: Request ACM Certificate
########################################
resource "aws_acm_certificate" "cvault_cert" {
  provider          = aws.us-east-1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

########################################
# Step 2: Create DNS Records for Validation
########################################
resource "aws_route53_record" "cvault_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cvault_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = var.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

########################################
# Step 3: Validate ACM Certificate
########################################
resource "aws_acm_certificate_validation" "cvault_cert" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.cvault_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cvault_cert_validation : record.fqdn]
}
