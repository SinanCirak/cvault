########################################
# Terraform Settings
# - Required provider versions
# - Minimum Terraform version
########################################
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" # Use AWS provider v5.x (ensures compatibility)
    }
  }

  # Require Terraform CLI 1.5.0 or newer
  required_version = ">= 1.5.0"
}

########################################
# AWS Provider (Primary region)
# - Default region: Canada (ca-central-1)
########################################
provider "aws" {
  region = "ca-central-1"
}
