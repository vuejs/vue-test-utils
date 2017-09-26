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

## Getting started

You can use our guides to get started with a test runner:

- [Testing SFCs with Jest](testing-SFCs-with-jest.md)
- [Testing SFCs with Mocha and webpack](testing-SFCs-with-mocha-webpack.md)

## Resources

- [Test runner performance comparison](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)