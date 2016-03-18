#!/bin/bash

#
# builds a production meteor bundle directory
#
set -e

printf "\n[-] Building Meteor application...\n\n"

: ${APP_BUNDLE_DIR:="/var/www"}
: ${BUILD_SCRIPTS_DIR:="/opt/redoc"}

cd $APP_SOURCE_DIR

# Install app deps (Meteor 1.3 style)
npm install

# build the source
mkdir -p $APP_BUNDLE_DIR
meteor build --directory $APP_BUNDLE_DIR
cd $APP_BUNDLE_DIR/bundle/programs/server/ && npm install

# put the entrypoint script in WORKDIR
mv $BUILD_SCRIPTS_DIR/entrypoint.sh $APP_BUNDLE_DIR/bundle/entrypoint.sh
