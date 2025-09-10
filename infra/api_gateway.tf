########################################
# REST API
########################################
resource "aws_api_gateway_rest_api" "cvault" {
  name = "cvault-api"
}

########################################
# /files Resource
########################################
resource "aws_api_gateway_resource" "files" {
  rest_api_id = aws_api_gateway_rest_api.cvault.id
  parent_id   = aws_api_gateway_rest_api.cvault.root_resource_id
  path_part   = "files"
}

########################################
# Cognito Authorizer
########################################
resource "aws_api_gateway_authorizer" "cvault_cognito" {
  name            = "cvault-cognito-auth"
  rest_api_id     = aws_api_gateway_rest_api.cvault.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [aws_cognito_user_pool.cvault.arn] # Cognito User Pool ARN
  identity_source = "method.request.header.Authorization"
}

########################################
# GET method (List files)
########################################
resource "aws_api_gateway_method" "files_get" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  resource_id   = aws_api_gateway_resource.files.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cvault_cognito.id
}

resource "aws_api_gateway_integration" "files_get" {
  rest_api_id             = aws_api_gateway_rest_api.cvault.id
  resource_id             = aws_api_gateway_resource.files.id
  http_method             = aws_api_gateway_method.files_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.file_ops.invoke_arn
}

########################################
# POST method (Upload / Delete via body)
########################################
resource "aws_api_gateway_method" "files_post" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  resource_id   = aws_api_gateway_resource.files.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cvault_cognito.id
}

resource "aws_api_gateway_integration" "files_post" {
  rest_api_id             = aws_api_gateway_rest_api.cvault.id
  resource_id             = aws_api_gateway_resource.files.id
  http_method             = aws_api_gateway_method.files_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.file_ops.invoke_arn
}

########################################
# DELETE method (Delete file)
########################################
resource "aws_api_gateway_method" "files_delete" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  resource_id   = aws_api_gateway_resource.files.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cvault_cognito.id
}

resource "aws_api_gateway_integration" "files_delete" {
  rest_api_id             = aws_api_gateway_rest_api.cvault.id
  resource_id             = aws_api_gateway_resource.files.id
  http_method             = aws_api_gateway_method.files_delete.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.file_ops.invoke_arn
}

########################################
# OPTIONS method (CORS preflight - public)
########################################
resource "aws_api_gateway_method" "files_options" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  resource_id   = aws_api_gateway_resource.files.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "files_options" {
  rest_api_id = aws_api_gateway_rest_api.cvault.id
  resource_id = aws_api_gateway_resource.files.id
  http_method = aws_api_gateway_method.files_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "files_options" {
  rest_api_id = aws_api_gateway_rest_api.cvault.id
  resource_id = aws_api_gateway_resource.files.id
  http_method = aws_api_gateway_method.files_options.http_method
  status_code = 200

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "files_options" {
  rest_api_id = aws_api_gateway_rest_api.cvault.id
  resource_id = aws_api_gateway_resource.files.id
  http_method = aws_api_gateway_method.files_options.http_method
  status_code = aws_api_gateway_method_response.files_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,GET,POST,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

########################################
# Gateway Responses (CORS on errors)
########################################

# 401 Unauthorized
resource "aws_api_gateway_gateway_response" "unauthorized" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  response_type = "UNAUTHORIZED"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTIONS,GET,POST,DELETE'"
  }
}

# 403 Access Denied
resource "aws_api_gateway_gateway_response" "access_denied" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  response_type = "ACCESS_DENIED"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTIONS,GET,POST,DELETE'"
  }
}

# 5XX Server Errors (default)
resource "aws_api_gateway_gateway_response" "server_error" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTIONS,GET,POST,DELETE'"
  }
}

########################################
# Deployment + Stage
########################################
resource "aws_api_gateway_deployment" "cvault" {
  rest_api_id = aws_api_gateway_rest_api.cvault.id

  triggers = {
    redeploy = timestamp() # Force redeploy when config changes
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.files_get,
    aws_api_gateway_integration.files_post,
    aws_api_gateway_integration.files_delete,
    aws_api_gateway_integration.files_options,
    aws_api_gateway_gateway_response.unauthorized,
    aws_api_gateway_gateway_response.access_denied,
    aws_api_gateway_gateway_response.server_error
  ]
}

resource "aws_api_gateway_stage" "cvault_dev" {
  rest_api_id   = aws_api_gateway_rest_api.cvault.id
  deployment_id = aws_api_gateway_deployment.cvault.id
  stage_name    = "dev"
}
