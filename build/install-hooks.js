const { test, ln, chmod } = require('shelljs')

if (test('-e', '.git/hooks')) {
  ln('-sf', '../../build/git-hooks/commit-msg', '.git/hooks/commit-msg')
  chmod('+x', '.git/hooks/commit-msg')
}
