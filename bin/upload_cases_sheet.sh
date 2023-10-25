#! /bin/bash
set -e

aws s3 cp --sse aws:kms --sse-kms-key-id $AWS_KMS_KEY_ID ../data/$1.xlsx s3://$AWS_BUCKET/uans/$1
# aws s3 rm s3://$AWS_BUCKET/uans/$1.xlsx
# aws s3 cp --sse aws:kms --sse-kms-key-id $AWS_KMS_KEY_ID s3://$AWS_BUCKET/uans/$1 ./$1.xlsx
