resource "aws_ecr_repository" "ecr" {
  image_scanning_configuration {
    scan_on_push = false
  }
  image_tag_mutability = "MUTABLE"
  name                 = "${local.prefix}_core"
}