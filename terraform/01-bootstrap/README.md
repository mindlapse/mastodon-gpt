# Bootstrap infrastructure layer

This is the bootstrap infrastructure layer.  It creates:

- a versioned remote state in S3 for Terraform, with cross-region backups
- a SecureString in AWS Systems Manager Parameter Store that will contain your API keys, access tokens, and other secrets
- a ECR repository where your lambda image can be uploaded.

## Instructions

1) Create a terraform.tfvars in this folder and provide your own config for these settings:
```
product       = "..."       # e.g. someuniquename (no underscores or hyphens)
env           = "..."       # e.g. prod
region        = "..."       # e.g. us-east-1
backup_region = "..."       # e.g. eu-west-1
aws_profile   = "..."       # e.g. gpt

MASTODON_API_URL       = "..."    # API URL for your Mastodon instance e.g. https://mastodon.solar/api/v1
MASTODON_ACCESS_TOKEN" = "..."    # The user access token you created for your Mastodon bot (with read & write permissions)
OPEN_AI_API_KEY        = "..."    # Your API key from OpenAI
```

2) Run `terraform apply`
3) Use `build.sh` (see the `/functions` folder) to build and upload the lambda image
5) Proceed to `/terraform/main` to apply the main infrastructure layer

Note: Changes to the SSM parameter are ignored - if you need to make an update, 
login to AWS and modify the secret with the AWS Systems Manager Parameter Store
