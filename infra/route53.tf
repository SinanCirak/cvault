########################################
# Route53 record for CloudFront (CNAME alias)
# - Maps custom domain to CloudFront distribution
########################################
resource "aws_route53_record" "cvault_domain" {
  zone_id = var.zone_id
  name    = var.domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_cloudfront_distribution.cvault.domain_name]
}
