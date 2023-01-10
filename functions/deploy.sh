#!/usr/bin/env bash

# Set to your primary region
region=some-region-1

# Set to <product>_<env>_core
image_name=botnamegoeshere_prod_core

set -e

if [[ "$AWS_PROFILE" == "" ]]; then
    echo "AWS_PROFILE is not set"
    exit 1
else
    echo "Using AWS_PROFILE $AWS_PROFILE"
fi

if [ "$1" == "" ]; then
    echo "Missing <function_name>"
    echo
    echo "Usage: deploy.sh <function_name>"
    echo
    echo "Example: ./deploy.sh botnamegoeshere_prod_reply_to_mentions"
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

echo "Publishing function"
aws lambda update-function-code --function-name $1 --image-uri ${account_id}.dkr.ecr.${region}.amazonaws.com/${image_name}:latest --publish --query 'FunctionArn'


if [[ $? == 0 ]]
then 
    status=""
    until [ "$status" == "\"Successful\"" ]
    do
        status=`aws lambda get-function --function-name $1 --query "Configuration.LastUpdateStatus"`
        echo $status
        sleep 1
    done
    echo "Deployed."

else
    echo "Failed."
fi