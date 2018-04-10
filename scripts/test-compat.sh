#!/bin/sh

set -e

echo "running unit tests with Vue $1"
yarn add -W -D vue@$1 vue-template-compiler@$1 vue-server-renderer@$1
yarn test:unit
yarn test:unit:karma
