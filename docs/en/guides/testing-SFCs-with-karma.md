# Testing Single File Components with Karma

> An example project for this setup is available on [GitHub](https://github.com/eddyerburgh/vue-test-utils-karma-example).

Karma is a test runner that launches browsers, runs tests, and reports them back to us. We're going to use the Mocha framework to write the tests. We'll use the chai library for test assertions.

## Setting up Mocha

We will assume you are starting with a setup that already has webpack, vue-loader and Babel properly configured - e.g. the `webpack-simple` template scaffolded by `vue-cli`.

The first thing to do is install the test dependencies:

``` bash
npm install --save-dev @vue/test-utils karma karma-chrome-launcher karma-mocha karma-sourcemap-loader karma-spec-reporter karma-webpack mocha
```

Next we need to define a test script in our `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "karma start --single-run"
  }
}
```

- The `--single-run` flag tells Karma to run the test suite once.

### Karma Configuration

Create a `karma.conf.js` file in the index of the project:

```js
// karma.conf.js

var webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'test/**/*.spec.js'
    ],

    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    reporters: ['spec'],

    browsers: ['Chrome']
  })
}
```

This file is used to configure Karma.

We need to preprocess our files with webpack. to do that, we add webpack as a preprocessor, and include our webpack config. We can use the webpack config file in the base of the project without changing anything.

In our configuration, we run the tests in Chrome. To add extra browsers, see [the Browsers section in the Karma docs](http://karma-runner.github.io/2.0/config/browsers.html).

### Picking an Assertion Library

[Chai](http://chaijs.com/) is a popular assertion library that is commonly used alongside Mocha. You may also want to check out [Sinon](http://sinonjs.org/) for creating spies and stubs.

We can install the `karma-chai` plugin to use `chai` in our tests.

``` bash
npm install --save-dev karma-chai
```

### Adding a test

Create a file in `src` named `Counter.vue`:

``` html
<template>
	<div>
	  {{ count }}
	  <button @click="increment">Increment</button>
	</div>
</template>

<script>
export default {
  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
</script>
```

And create a test file named `test/Counter.spec.js` with the following code:

```js
import { expect } from 'chai'
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).contains('1')
  })
})
```

And now we can run the tests:

```
npm run test
```

Woohoo, we got our tests running!

### Coverage

To setup code coverage to Karma, we can use the `karma-coverage` plugin.

By default, `karma-coverage` won't use source maps to map the coverage reports. So we need to use `babel-plugin-istanbul` to make sure the coverage is mapped correctly.

Install `karma-coverage`, `babel-plugin-istanbul`, and `cross-env`:

```
npm install --save-dev karma-coverage cross-env
```

We're going to use `cross-env` to set a `BABEL_ENV` environment variable. This way we can use `babel-plugin-istanbul` when we're compiling for our tests—we don't want to include `babel-plugin-istnabul` when we compile our production code:

```
npm install --save-dev babel-plugin-istanbul
```

Update your `.babelrc` file to use `babel-plugin-istanbul` when `BABEL_ENV` is set to test:

```json
{
  "presets": [
    ["env", { "modules": false }],
    "stage-3"
  ],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}
```

Now update the `karma.conf.js` file to use coverage. Add `coverage` to the `reporters` array, and add a `coverageReporter` field:

```js
// karma.conf.js

module.exports = function (config) {
  config.set({
  // ...

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
```

And update the `test` script to set the `BABEL_ENV`:

```json
// package.json
{
  "scripts": {
    "test": "cross-env BABEL_ENV=test karma start --single-run"
  }
}
```

### Resources

- [Example project for this setup](https://github.com/eddyerburgh/vue-test-utils-karma-example)
- [Karma](http://karma-runner.github.io/)
- [Mocha](https://mochajs.org/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
