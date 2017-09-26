# Choosing a test runner

A test runner is a program that runs tests.

There are many popular JavaScript test runners, and Vue Test Utils works in all of them. It's test runner agnostic.

However, some popular test runners do not have good support for compiling single file components (SFCs).

## Performance

The fastest test runners are:

- Jest
- Mocha Webpack
- tape

You can see a performance comparisson of popular test runners [here](https://github.com/eddyerburgh/vue-unit-test-perf-comparison).

## Features

Jest is the most fully featured test runner. It requires the leat configuration, as it sets up JSDOM by default.

tape is very minimal. If you choose tape, you will need to do a lot of set up yourself.

To run SFCs in Jest, you need to use jest-vue—a transformer for Jest. jest-vue does not support styles or custom blocks. If you need to use those features, you'll need to use webpack. Mocha works well with webpack, you can read the guide on [testing SFCs with mocha](testing-SFCs-with-mocha-webpack.md) to get started.

## Getting started

You can use our guides to get started with a test runner:

- [Testing SFCs with Jest](testing-SFCs-with-jest.md)
- [Testing SFCs with Mocha and webpack](testing-SFCs-with-mocha-webpack.md)

## Resources

- [Test runner performance comparison](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Example project with Jest](https://github.com/eddyerburgh/vue-test-utils-jest-example)
- [Example project with Mocha](https://github.com/eddyerburgh/vue-test-utils-mocha-example)
- [Example project with tape](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [Example project with AVA](https://github.com/eddyerburgh/vue-test-utils-ava-example)