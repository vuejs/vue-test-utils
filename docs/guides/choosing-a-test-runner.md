## Choosing a test runner

A test runner is a program that runs tests.

There are many popular JavaScript test runners, and Vue Test Utils works with all of them. It's test runner agnostic.

There are a few things to consider when choosing a test runner though: feature set, performance, and support for single-file component (SFC) pre-compilation. After carefully comparing existing libraries, here are two test runners that we recommend:

- [Jest](https://jestjs.io/docs/en/getting-started#content) is the most fully featured test runner. It requires the least configuration, sets up JSDOM by default, provides built-in assertions, and has a great command line user experience. However, you will need a preprocessor to be able to import SFC components in your tests. We have created the `vue-jest` preprocessor which can handle most common SFC features, but it currently does not have 100% feature parity with `vue-loader`.

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack) is a wrapper around webpack + Mocha, but with a more streamlined interface and watch mode. The benefits of this setup is that we can get complete SFC support via webpack + `vue-loader`, but it requires more configuration upfront.

### Browser Environment

Vue Test Utils relies on a browser environment. Technically you can run it in a real browser, but it's not recommended due to the complexity of launching real browsers on different platforms. Instead, we recommend running the tests in Node with a virtual browser environment using [JSDOM](https://github.com/tmpvar/jsdom).

The Jest test runner sets up JSDOM automatically. For other test runners, you can manually set up JSDOM for the tests using [jsdom-global](https://github.com/rstacruz/jsdom-global) in the entry for your tests:

```bash
npm install --save-dev jsdom jsdom-global
```

---

```js
// in test setup / entry
require('jsdom-global')()
```

### Testing Single-File Components

Single-file Vue components (SFCs) require pre-compilation before they can be run in Node or in the browser. There are two recommended ways to perform the compilation: with a Jest preprocessor, or directly use webpack.

The `vue-jest` preprocessor supports basic SFC functionalities, but currently does not handle style blocks or custom blocks, which are only supported in `vue-loader`. If you rely on these features or other webpack-specific configurations, you will need to use a webpack + `vue-loader` based setup.

Read the following guides for different setups:

- [Testing Single-File Components with Jest](./testing-single-file-components-with-jest.md)
- [Testing Single-File Components with Mocha + webpack](./testing-single-file-components-with-mocha-webpack.md)

### Resources

- [Test runner performance comparison](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Example project with Jest](https://github.com/vuejs/vue-test-utils-jest-example)
- [Example project with Mocha](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Example project with tape](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [Example project with AVA](https://github.com/eddyerburgh/vue-test-utils-ava-example)
- [tyu - Delightful web testing by egoist](https://github.com/egoist/tyu)
