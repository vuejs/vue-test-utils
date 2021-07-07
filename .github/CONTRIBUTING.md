# Vue Test Utils Contributing Guide

Hi! I’m really excited that you are interested in contributing to Vue Test Utils. Before submitting your contribution though, please make sure to take a moment and read through the following guidelines.

- [Code of Conduct](https://github.com/vuejs/vue/blob/dev/.github/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Committing Changes](#committing-changes)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Issue Reporting Guidelines

- Always use [https://new-issue.vuejs.org/](https://new-issue.vuejs.org/) to create new issues.

## Pull Request Guidelines

- Checkout a topic branch from the relevant branch, e.g. `dev`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- Make sure `yarn test` passes. (see [development setup](#development-setup))

- If adding new feature:

  - Add accompanying test case.
  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.

- If fixing a bug:
  - If you are resolving a special issue, add `(fix #xxxx[,#xxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

### Committing Changes

Commit messages should follow the [commit message convention](./COMMIT_CONVENTIONS.md) so that changelogs can be automatically generated. Commit messages will be automatically validated upon commit. If you are not familiar with the commit message convention, you can use `yarn commit` instead of `git commit`, which provides an interactive CLI for generating proper commit messages.

## Development Setup

You will need [Node.js](http://nodejs.org) **version 10+**

Vue Test Utils is a monorepo. It contains a root `package.json` for running scripts across the project. The code is inside separate packages in the `packages` directory. The project uses [lerna](https://lerna.js.org/) to manage the workspaces and should be run using [yarn](https://yarnpkg.com/lang/en/).

After cloning the repo, run:

```bash
$ yarn
```

### Commonly used NPM scripts

```bash
# run unit tests with mocha-webpack
$ yarn test:unit

# run the full test suite, include linting / type checking
$ yarn test
```

There are some other scripts available in the `scripts` section of the `package.json` file.

The default test script will do the following: lint with ESLint -> type check with Flow -> unit tests. **Please make sure to have this pass successfully before submitting a PR.** Although the same tests will be run against your PR on the CI server, it is better to have it working locally beforehand.

## Project Structure

- **`docs`**: contains files used to generate https://vue-test-utils.vuejs.org/ with [VuePress](https://github.com/vuejs/vuepress).

- **`flow`**: contains type declarations for [Flow](https://flowtype.org/). These declarations are loaded **globally** and you will see them used in type annotations in normal source code.

- **`packages`**: contains the `test-utils` and `server-test-utils` public packages. Also contains private packages `shared` and `create-instance` wich are used by `test-utils` and `server-test-utils`. The codebase is written in ES2015 with [Flow](https://flowtype.org/) type annotations.

  - **`test-utils`**: the @vue/test-utils package.

    - **`dist`**: contains built files for distribution. Note this directory is only updated when a release happens; they do not reflect the latest changes in development branches.

  - **`server-test-utils`**: the @vue/server-test-utils package

    - **`dist`**: contains built files for distribution. Note this directory is only updated when a release happens; they do not reflect the latest changes in development branches.

  - **`create-instance`**: private package that creates an instance and applies mounting options.

  - **`shared`**: private package that contains utilities used by the other packages.

- **`scripts`**: contains build-related scripts and configuration files. In most cases you don't need to touch them.

- **`test`**: contains all tests. The unit tests are written with [Mocha](https://mochajs.org/) and run with [Karma](http://karma-runner.github.io/0.13/index.html) and [mocha-webpack](http://zinserjan.github.io/mocha-webpack/), which compiles the code with webpack before running it in mocha.

- **`types`**: contains TypeScript type definitions

  - **`test`**: type definitions tests
