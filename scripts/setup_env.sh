#!/bin/bash

# setup_env.sh - Setup local environment variables

echo "Setting up local environment variables..."

if [ ! -f .env ]; then
  echo "PORT=3000" > .env
  echo "NODE_ENV=development" >> .env
  echo ".env file created with default values."
else
  echo ".env file already exists."
fi

echo "Environment setup complete."
