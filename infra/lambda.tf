########################################
# Lambda Function for File Operations
# - Handles S3 file actions (upload, delete, list, download)
# - Triggered by API Gateway
########################################
resource "aws_lambda_function" "file_ops" {
  function_name = "cvault-file-ops"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"

  # Deployment package (zipped source)
  filename         = "${path.module}/lambda/file_ops.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda/file_ops.zip")

  # Environment variables passed into Lambda
  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.cvault_uploads.bucket
    }
  }
}

########################################
# Lambda Permission for API Gateway
# - Grants API Gateway permission to invoke this Lambda
########################################
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.file_ops.function_name
  principal     = "apigateway.amazonaws.com"
}
