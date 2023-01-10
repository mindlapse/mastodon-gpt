#!/usr/bin/env bash

# Set to your primary region
region=ca-central-1

# Set to <product>_<env>_core
image_name=aibot_prod_core

set -e

if [[ "$AWS_PROFILE" == "" ]]; then
    echo "AWS_PROFILE is not set"
    exit 1
else
    echo "Using AWS_PROFILE $AWS_PROFILE"
fi

if [ "$1" == "" ]; then
    echo
    echo "Missing <function_name>"
    echo
    echo "Usage: push_image.sh <function_name>"
    echo
    echo "Example: ./push_image.sh aibot_prod_reply_to_mentions"
    echo
    exit 1
fi


account_id=`aws sts get-caller-identity --query "Account" --output text`


echo "Building image"
npx tsc && docker build -t ${account_id}.dkr.ecr.${region}.amazonaws.com/${image_name}:latest .

echo "Docker logging in"
aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${account_id}.dkr.ecr.${region}.amazonaws.com

echo "Pushing image"
docker push ${account_id}.dkr.ecr.${region}.amazonaws.com/${image_name}:latest
