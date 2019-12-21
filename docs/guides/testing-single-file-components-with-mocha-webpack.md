## Testing Single-File Components with Mocha + webpack

Another strategy for testing SFCs is compiling all our tests via webpack and then run it in a test runner. The advantage of this approach is that it gives us full support for all webpack and `vue-loader` features, so we don't have to make compromises in our source code.

You can technically use any test runner you like and manually wire things together, but we've found [`mochapack`](https://github.com/sysgears/mochapack) to provide a very streamlined experience for this particular task.

### Setting Up `mochapack`

We will assume you are starting with a setup that already has webpack, vue-loader and Babel properly configured - e.g. the `webpack-simple` template scaffolded by `vue-cli`.

The first thing to do is installing test dependencies:

```bash
npm install --save-dev @vue/test-utils mocha mochapack
```

Next we need to define a test script in our `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "mochapack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

A few things to note here:

- The `--webpack-config` flag specifies the webpack config file to use for the tests. In most cases, this would be identical to the config you use for the actual project with one small tweak. We will talk about this later.

- The `--require` flag ensures the file `test/setup.js` is run before any tests, in which we can setup the global environment for our tests to be run in.

- The final argument is a glob for the test files to be included in the test bundle.

### Extra webpack Configuration

#### Externalizing NPM Dependencies

In our tests we will likely import a number of NPM dependencies - some of these modules may be written without browser usage in mind and simply cannot be bundled properly by webpack. Another consideration is externalizing dependencies greatly improves test boot up speed. We can externalize all NPM dependencies with `webpack-node-externals`:

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### Source Maps

Source maps need to be inlined to be picked up by `mochapack`. The recommended config is:

```js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

If debugging via IDE, it's also recommended to add the following:

```js
module.exports = {
  // ...
  output: {
    // ...
    // use absolute paths in sourcemaps (important for debugging via IDE)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### Setting Up Browser Environment

Vue Test Utils requires a browser environment to run. We can simulate it in Node using `jsdom-global`:

```bash
npm install --save-dev jsdom jsdom-global
```

Then in `test/setup.js`:

```js
require('jsdom-global')()
```

This adds a browser environment to Node, so that Vue Test Utils can run correctly.

### Picking an Assertion Library

[Chai](http://chaijs.com/) is a popular assertion library that is commonly used alongside Mocha. You may also want to check out [Sinon](http://sinonjs.org/) for creating spies and stubs.

Alternatively you can use `expect` which is now part of Jest, and exposes [the exact same API](https://jestjs.io/docs/en/expect#content) in Jest docs.

We will be using `expect` here and make it globally available so that we don't have to import it in every test:

```bash
npm install --save-dev expect
```

Then in `test/setup.js`:

```js
require('jsdom-global')()

global.expect = require('expect')
```

### Optimizing Babel for Tests

Notice that we are using `babel-loader` to handle JavaScript. You should already have Babel configured if you are using it in your app via a `.babelrc` file. Here `babel-loader` will automatically use the same config file.

One thing to note is that if you are using Node 6+, which already supports the majority of ES2015 features, you can configure a separate Babel [env option](https://babeljs.io/docs/usage/babelrc/#env-option) that only transpiles features that are not already supported in the Node version you are using (e.g. `stage-2` or flow syntax support, etc.).

### Adding a test

Create a file in `src` named `Counter.vue`:

```html
<template>
  <div>
    {{ count }}
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        count: 0
      }
    },

    methods: {
      increment() {
        this.count++
      }
    }
  }
</script>
```

And create a test file named `test/Counter.spec.js` with the following code:

```js
import { shallowMount } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallowMount(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toMatch('1')
  })
})
```

And now we can run the test:

```
npm run test
```

Woohoo, we got our tests running!

### Coverage

To setup code coverage to `mochapack`, follow [the `mochapack` code coverage guide](https://github.com/sysgears/mochapack/blob/master/docs/guides/code-coverage.md).

### Resources

- [Mocha](https://mochajs.org/)
- [mochapack](https://github.com/sysgears/mochapack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](https://jestjs.io/docs/en/expect#content)
