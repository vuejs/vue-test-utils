set -e

if [[ -z $1 ]]; then
  echo "Enter new version: "
  read VERSION
else
  VERSION=$1
fi

read -p "Releasing $VERSION - are you sure? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing $VERSION ..."

  npm run test

  # build
  npm run build

  # commit
  git add -A
  git add -f \
    dist/*.js
  git commit -m "build: $VERSION"
  npm version $VERSION --message "release: $VERSION"

  # publish
  git push origin refs/tags/v$VERSION
  git push
  npm publish

  # generate release note
  VERSION=$VERSION npm run release:note
fi