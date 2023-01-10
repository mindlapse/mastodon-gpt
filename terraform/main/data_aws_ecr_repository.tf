data "aws_ecr_repository" "lambda_image" {
  name = "${local.prefix}_core"
}