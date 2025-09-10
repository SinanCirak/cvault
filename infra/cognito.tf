########################################
# Cognito User Pool
# - Handles user management (signup, login, password policies)
########################################
resource "aws_cognito_user_pool" "cvault" {
  name = "cvault-user-pool"

  # Users will log in using their email address
  username_attributes = ["email"]

  # Strong password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
}

########################################
# Cognito User Pool Client
# - Frontend app connection to the user pool
# - No client secret (suitable for SPAs)
########################################
resource "aws_cognito_user_pool_client" "cvault" {
  name         = "cvault-client"
  user_pool_id = aws_cognito_user_pool.cvault.id
  generate_secret = false # SPA (React) cannot securely store client secrets

  # Allowed authentication flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",         # Direct login with username/password
    "ALLOW_REFRESH_TOKEN_AUTH",         # Use refresh tokens
    "ALLOW_USER_SRP_AUTH",              # Secure Remote Password flow
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"    # Admin login option
  ]

  # Prevent leaking existence of users (security best practice)
  prevent_user_existence_errors = "ENABLED"
}

########################################
# Cognito Domain
# - Hosted UI / OAuth flows will use this domain
# - Random suffix to ensure uniqueness
########################################
resource "aws_cognito_user_pool_domain" "cvault" {
  domain       = "cvault-login-${random_id.suffix.hex}"
  user_pool_id = aws_cognito_user_pool.cvault.id
}

########################################
# Random Suffix (to avoid domain collisions)
########################################
resource "random_id" "suffix" {
  byte_length = 4
}
