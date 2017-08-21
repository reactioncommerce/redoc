#!/bin/bash

set -e

# build new base and app images
docker build -t reactioncommerce/redoc:latest .

# run the container and wait for it to boot
docker-compose -f .circleci/docker-compose.yml up -d
sleep 20

# use curl to ensure the app returns 200's
docker exec redoc bash -c "apt-get update && apt-get install -y curl && \
  curl --retry 10 --retry-delay 10 -v http://localhost:3000"
