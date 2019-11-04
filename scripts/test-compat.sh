#!/bin/sh

set -e

run() {
  echo "running unit tests with Vue $1"
  yarn add --pure-lockfile --non-interactive -W -D "vue@$1" "vue-template-compiler@$1" "vue-server-renderer@$1"
  yarn test:unit
  yarn test:unit:karma
}

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
