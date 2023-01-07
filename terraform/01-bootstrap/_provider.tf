provider "aws" {
  region  = local.region
  profile = local.aws_profile
  default_tags {
    tags = {
      product = local.product
      env     = local.env
    }
  }
}
