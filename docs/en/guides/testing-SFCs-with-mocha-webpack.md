# Testing single file components with Mocha + webpack

We need to compile single file components (SFCs) to run them in Mocha.

We can make use of a package called `mocha-webpack`, that does exactly that. It compiles source files in webpack before running Mocha.

## Setting up mocha-webpack

The first thing to do is install Mocha, mocha webpack, webpack and webpack loaders:

```bash
npm install --save-dev vue-test-utils mocha mocha-webpack webpack webpack-node-externals vue vue-loader css-loader babel-loader
```

Next we need to define a unit script in our `package.json`.

```json
// package.json
{
  "scripts": {
    "unit": "mocha-webpack --webpack-config build/webpack.conf.js test --recursive --require test/setup.js"
  }
}
```

This script tells `mocha-webpack` to get the webpack config from `build/webpack.conf.js`, run all test files in the test directory and run `test/setup.js` before the tests.

### Setting Up Browser Environment

Let's create the setup.js script first.

`vue-test-utils` requires a browser environment to run. We can set one up using `jsdom-global`, which setups a JSDOM instance and attaches necessary globals to the Node process.

Let's install the dependencies:

```bash
npm install --save-dev jsdom jsdom-global
```

Create a `test/setup.js` file and paste the following code in:

``` js
require('jsdom-global')()
```

This adds a browser environment to node, so that `vue-test-utils` can run correctly.

### Configuring webpack

Now we need to create a webpack config file. In most cases your test config should use the same `module` rules with your projects existing webpack config. We recommend extracting the common config options into a base file and extend it separately for build and testing.

One specific tweak needed for the test config is that we should externalize Node dependencies with `webpack-node-externals`. This significantly speeds up the bundling process.

For our example project, the config looks like this:

```js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  externals: [nodeExternals()],
  devtool: '#eval-source-map'
}
```

### Configuring Babel

Notice that we are using `babel-loader` to handle JavaScript. You should already have Babel configured if you are using it in your app, e.g. via a `.babelrc` file. Here `babel-loader` will automatically use the same config file.

One thing to note is that if you are using Node 6+, which already supports the majority of ES2015 features, you can configure a separate Babel [env option](https://babeljs.io/docs/usage/babelrc/#env-option) that only transpiles features that are not already supported in the Node version you are using (e.g. `stage-2` or flow syntax support, etc.)

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
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).to.contain('1')
  })
})
```

Notice we're using `expect` from `chai` to make our assertion. We need to install chai before running the tests:

```
npm install --save-dev chai
```

And now we can run the test:

```
npm run unit
```

Woohoo, we got our tests running!

### Resources

- [Example project using mocha-webpack](https://github.com/eddyerburgh/vue-test-utils-mocha-example)
