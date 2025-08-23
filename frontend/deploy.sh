#!/bin/bash
# Build the web version of the Expo app and upload it to an S3 bucket.

set -e

# Pass the S3 bucket name as the first argument
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <s3-bucket-name>"
  exit 1
fi

BUCKET_NAME=$1
BUILD_DIR="dist"

echo "Building..."
npx expo export -p web

echo "Uploading to S3..."
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete

echo "✅ Done!"
