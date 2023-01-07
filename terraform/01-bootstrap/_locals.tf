data "aws_caller_identity" "current" {}

locals {
  product       = "aibot"
  env           = "prod"
  region        = "ca-central-1"
  backup_region = "ap-southeast-2"
  aws_profile   = "mastodon"
  account_id    = data.aws_caller_identity.current.account_id

  prefix = "${local.product}_${local.env}"
}
