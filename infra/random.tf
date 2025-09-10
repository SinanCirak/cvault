########################################
# Random Suffix for Unique Bucket Names
# - Ensures S3 bucket names are globally unique
# - 4 bytes (8 hex chars) appended to bucket name
########################################
resource "random_id" "bucket_suffix" {
  byte_length = 4
}
