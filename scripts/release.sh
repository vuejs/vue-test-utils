npm run release

VERSION=$(jq -r .version packages/test-utils/package.json)

git add -A
git commit -m "chore(release): add dist files $VERSION"
git push
