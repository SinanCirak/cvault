########################################
# Input Variables
# - Customize environment without changing code
########################################

# Custom domain to be mapped to CloudFront
variable "domain_name" {
  description = "Custom domain for CloudFront "
  type        = string
}

# Route53 hosted zone ID for the domain
# Used to create DNS records pointing to CloudFront
variable "zone_id" {
  description = "Route53 Hosted Zone ID for the domain"
  type        = string
}

# Primary AWS region (used for most resources)
# Note: ACM certificates for CloudFront must be in us-east-1
variable "aws_region" {
  description = "AWS Region (default deployment region)"
  type        = string
}
