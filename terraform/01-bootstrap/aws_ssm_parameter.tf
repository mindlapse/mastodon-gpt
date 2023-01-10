resource "aws_ssm_parameter" "config" {
  name = "/${local.product}/${local.env}/config"
  type = "SecureString"


  // For security reasons, secrets must be populated manually outside of Terraform.
  value = jsonencode({

    MASTODON_API_URL      = ""
    MASTODON_ACCESS_TOKEN = ""
    OPEN_AI_API_KEY       = ""

  })

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}
