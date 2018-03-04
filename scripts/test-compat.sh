#!/bin/sh

set -e

test_version_number(){
  echo "running unit tests with Vue $1"
  yarn add -W -D vue@$1 vue-template-compiler@$1 vue-server-renderer@$1
  yarn test:unit
  yarn test:unit:karma
}

test_version_number "2.0.8"
test_version_number "2.1.10"
test_version_number "2.2.6"
test_version_number "2.3.4"
test_version_number "2.4.2"
test_version_number "2.5.13"
