# Main infrastructure layer

This is the main infrastructure layer.  It creates:

- a Lambda (for replying to mentions) that is periodically invoked via a CloudWatch timer
- Any necessary permissions

## Instructions

1) Create a terraform.tfvars in this folder with the same config from the bootstrap layer (exclude backup_region)
```
product       = "..."       # e.g. someuniquename (no underscores or hyphens)
env           = "..."       # e.g. prod
region        = "..."       # e.g. us-east-1
aws_profile   = "..."       # e.g. gpt
```

1) Run `terraform apply`
2) ./pu.sh the lambda image (see the /functions folder)
