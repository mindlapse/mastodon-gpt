resource "aws_ssm_parameter" "config" {
  name = "/${local.product}/${local.env}/config"
  type = "SecureString"


  // For security reasons, secrets must be populated manually outside of Terraform.
  value = jsonencode({

    REDIS_URL = ""
    CLIENT_ID = ""
    CLIENT_SECRET = ""
    MASTODON_API_URL = ""

  })

  lifecycle {
    ignore_changes = [
      "value"
    ]
  }
}
