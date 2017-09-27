# Choosing a test runner

A test runner is a program that runs tests.

There are many popular JavaScript test runners, and `vue-test-utils` works with all of them. It's test runner agnostic.

There are a few things to consider when choosing a test runner though: feature set, performance, and support for single-file component (SFC) pre-compilation. After carefully comparing existing libraries, here are two test runners that we recommend:

- [Jest](https://facebook.github.io/jest/docs/en/getting-started.html#content) is the most fully featured test runner. It requires the least configuration, sets up JSDOM by default, and has a great command line user experience. However, you will need a preprocessor to be able to import SFC components in your tests. We have created the `jest-vue` preprocessor which can handle most common SFC features, but it currently does not have 100% feature parity with `vue-loader`.

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack) is a wrapper around webpack + Mocha, but with a more streamlined interface and watch mode. The benefits of this setup is that we can get complete SFC support via webpack + `vue-loader`, but it requires more configuration upfront.

## Getting started

You can read the following guides to get started with either test runner:

- [Testing SFCs with Jest](testing-SFCs-with-jest.md)
- [Testing SFCs with Mocha and webpack](testing-SFCs-with-mocha-webpack.md)

## Resources

- [Test runner performance comparison](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Example project with Jest](https://github.com/eddyerburgh/vue-test-utils-jest-example)
- [Example project with Mocha](https://github.com/eddyerburgh/vue-test-utils-mocha-example)
- [Example project with tape](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [Example project with AVA](https://github.com/eddyerburgh/vue-test-utils-ava-example)
