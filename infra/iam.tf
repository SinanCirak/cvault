########################################
# IAM Role for Lambda Execution
# - Grants Lambda service permission to assume this role
########################################
resource "aws_iam_role" "lambda_exec" {
  name = "cvault-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "sts:AssumeRole",
        Principal = {
          Service = "lambda.amazonaws.com" # Only Lambda service can assume this role
        }
      }
    ]
  })
}

########################################
# IAM Inline Policy for Lambda → S3 access
# - Allows object-level and bucket-level actions
########################################
resource "aws_iam_role_policy" "lambda_s3" {
  name = "cvault-lambda-s3"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      # Object-level actions (read, write, delete)
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        Resource = "${aws_s3_bucket.cvault_uploads.arn}/*"
      },
      # Bucket-level action (list objects)
      {
        Effect   = "Allow",
        Action   = "s3:ListBucket",
        Resource = "${aws_s3_bucket.cvault_uploads.arn}"
      }
    ]
  })
}
