data "aws_caller_identity" "current" {}

locals {
  product          = var.product
  env              = var.env
  region           = var.region
  aws_profile      = var.aws_profile
  account_id       = data.aws_caller_identity.current.account_id
  prefix           = "${local.product}_${local.env}"
  function_timeout = 240
}
