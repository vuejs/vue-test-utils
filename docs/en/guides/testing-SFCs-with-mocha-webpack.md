# Testing single file components with Mocha

We need to compile single file components (SFCs) to run them in Mocha.

We can make use of a package called mocha-webpack, that does exactly that. It compiles source files in webpack before running Mocha.

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

This script tells mocha-webpack to get the webpack config from build/webpack.conf.js, run all test files in the test directory and run test/setup.js before the tests.

Let's create the setup.js script first.

Vue Test Utils requires a browser environment to run. We can set one up using browser-env (a wrapper around JSDOM).

Let's install that:

```
npm install --save-dev browser-env
```

Create a test/setup.js file and paste the following code in:

```
require('browser-env')();
```

This adds a browser environment to node, so that Vue Test Utils can run correctly.

Next, we need to install babel and configure it so we can use ES6 features in our JavaScript:

```bash
npm install --save-dev babel-core babel-preset-env
```

and create a .babelrc file in the root of the project, that tells babel to use the env preset:

```json
// .babelrc
{
  "presets": ["env"]
}
```

*babel-preset-env allows compiling the JS based on the browsers you plan to support. Get more info here: [babel-preset-env](https://github.com/babel/babel-preset-env)*

Now we need to create a webpack config file. Create a build/webpack.conf.js file, and add the following code:

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

That's the setup done. Now to add a test.


## Adding a test

Create a file in src named Counter.vue.

Paste the following code in src/Counter.vue:


```vue
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

And create a test file—`test/Counter.spec.js`. Paste the code below into the file:

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

Notice we're using expect from chai to make our assertion. We need to install chai before running the tests:

```
npm install --save-dev chai
```

And now we can run the test:

```
npm run unit
```

Great, the tests are running!

### Resources

- [Example project using mocha-webpack](https://github.com/eddyerburgh/vue-test-utils-mocha-example)