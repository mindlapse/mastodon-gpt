module "cache_following" {
  source           = "github.com/mindlapse/terraform_modules/aws/scheduled_lambda"
  env              = local.env
  product          = local.product
  image_name       = data.aws_ecr_repository.lambda_image.name
  image_version    = "latest"
  function_name    = "reply_to_mentions"
  function_timeout = local.function_timeout
  lambda_policies = [
    aws_iam_policy.read_ssm_config.arn
  ]
  environment = {
    COMMAND = "reply_to_mentions"
  }
  schedule_expression = "rate(2 minutes)"
  fifo                = false
}

