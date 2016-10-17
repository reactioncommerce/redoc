#!/bin/bash

# build the base container and then the app container
docker build -f docker/base.dockerfile -t reactioncommerce/redoc:base .
docker build -t reactioncommerce/redoc:latest .
