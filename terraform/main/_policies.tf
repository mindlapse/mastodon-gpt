resource "aws_iam_policy" "read_ssm_config" {
  name = "${local.prefix}_config_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{

      Action   = "ssm:GetParameter"
      Effect   = "Allow"
      Sid      = ""
      Resource = "arn:aws:ssm:${local.region}:${local.account_id}:parameter/${local.product}/${local.env}/*"

    }]
  })
}