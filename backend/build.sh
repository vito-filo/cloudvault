#!/bin/bash

# Set NODE_ENV to production
export NODE_ENV=production
echo "NODE_ENV set to production"

# Run nest build
echo "Building NestJS project..."
nest build --webpack --webpackPath webpack.config.js

# Navigate to the dist directory
cd dist || { echo "dist directory not found"; exit 1; }

# Create a zip file of the dist directory
echo "Creating zip file..."
# Ensure the .serverless directory exists
mkdir -p ../.serverless
echo ".serverless directory ensured"
zip -r ../.serverless/cloud-vault-backend.zip ./*

echo "Build completed zip file created at .serverless/cloud-vault-backend.zip"
echo "To deploy, run 'tf apply -target=module.lambda -var-file=prod.tfvars'"