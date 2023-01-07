module "boostrap" {
  source = "github.com/mindlapse/terraform_modules/aws/bootstrap/tf_remote_state"

  product = local.product
  env     = local.env

  primary_region = local.region
  backup_region  = local.backup_region
}
