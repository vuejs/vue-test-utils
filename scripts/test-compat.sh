#!/bin/sh

set -e

apt-get install bc

run() {
  # Only run tests for vue versions above 2.1.
  # There are quite a few errors present with running the tests in Vue 2.1 and Vue 2.0, including in Node and in browser
  browserTestCutoff="2.1"

  if [ 1 -eq "$(echo "${browserTestCutoff} < ${1}" | bc)" ]
  then
      echo "running unit tests with Vue $1"
      yarn add --pure-lockfile --non-interactive -W -D "vue@$1" "vue-template-compiler@$1" "vue-server-renderer@$1"
      yarn test:unit -w 1
      yarn test:unit:browser
  fi
}

yarn build:test

if [ "$1" ]; then
  run "$1"
  exit
fi

vue_version=$(yarn -s info vue version)
vue_major=$(echo "$vue_version" | cut -d. -f1)
vue_minor=$(echo "$vue_version" | cut -d. -f2)

while [ "$vue_minor" -gt 0 ]; do
  vue_minor=$((vue_minor - 1))

  run "${vue_major}.${vue_minor}"
done
