#!/bin/bash

set -ex

if [[ "$CIRCLE_BRANCH" != "master" ]]; then
  echo "Not running a deployment branch."
  exit 0
fi

docker tag reactioncommerce/redoc:latest reactioncommerce/redoc:$CIRCLE_BUILD_NUM

docker login -u $DOCKER_USER -p $DOCKER_PASS

docker push reactioncommerce/redoc:$CIRCLE_BUILD_NUM
docker push reactioncommerce/redoc:latest
