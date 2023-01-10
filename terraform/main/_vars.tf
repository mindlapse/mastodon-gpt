variable "product" {
  type        = string
  description = "A unique name (no underscores or hyphens)"
}

variable "env" {
  type        = string
  description = "An environment label (e.g. dev or prod)"
}

variable "region" {
  type        = string
  description = "The primary region"
}

variable "aws_profile" {
  type        = string
  description = "The name of the AWS_PROFILE to use.  Typically defined in ~/.aws/credentials"
}
