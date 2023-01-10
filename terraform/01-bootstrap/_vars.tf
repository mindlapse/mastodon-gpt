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

variable "backup_region" {
  type        = string
  description = "The backup region for the terraform infrastructure"
}

variable "aws_profile" {
  type        = string
  description = "The name of the AWS_PROFILE to use.  Typically defined in ~/.aws/credentials"
}

variable "MASTODON_API_URL" {
  type        = string
  description = "API URL for your Mastodon instance e.g. https://mastodon.solar/api/v1"
}

variable "MASTODON_ACCESS_TOKEN" {
  type        = string
  description = "The user access token you created for your Mastodon bot (with read & write permissions)"
}

variable "OPEN_AI_API_KEY" {
  type = string
  description = "An API key from OpenAI"
}
