## Using other Test runners

### Running Vue Test Utils with Karma

[Karma](http://karma-runner.github.io/) is a test runner that launches browsers, runs tests, and reports them back to us.

In addition to Karma, you might want to use the [Mocha](https://mochajs.org/) framework to write the tests, and the [Chai](http://chaijs.com/) library for test assertions. Also, you may also want to check out [Sinon](http://sinonjs.org/) for creating spies and stubs.

Following is a basic Karma config for Vue Test Utils:

```js
// karma.conf.js
var webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],
    files: ['test/**/*.spec.js'],
    webpack: webpackConfig,
    reporters: ['spec'],
    browsers: ['Chrome'],
    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap']
    }
  })
}
```

### Running Vue Test Utils with mocha-webpack

Another strategy for testing SFCs is compiling all our tests via webpack and then run it in a test runner. The advantage of this approach is that it gives us full support for all webpack and `vue-loader` features, so we don't have to make compromises in our source code.

We've found [`mochapack`](https://github.com/sysgears/mochapack) to provide a very streamlined experience for this particular task.

The first thing to do is installing test dependencies:

```bash
npm install --save-dev @vue/test-utils mocha mochapack
```

After installing Vue Test Utils and `mochapack`, you will need to define a test script in your `package.json`:

```json
// package.json
{
  "scripts": {
    "test": "mochapack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

### Running Vue Test Utils without a build step

While it is common to build Vue applications using tools such as [webpack](https://webpack.js.org/) to bundle the application, `vue-loader` to leverage Single File Components, it is possible to use Vue Test Utils with much less. The minimal requirements for Vue Test Utils, aside from the library itself are:

- Vue
- [vue-template-compiler](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#readme)
- a DOM (be it [jsdom](https://github.com/jsdom/jsdom) in a Node environment, or the DOM in a real browser)

Notice that `jsdom`(or any other DOM implementation) must be required before Vue Test Utils, because it expects a DOM (real DOM, or JSDOM) to exist.
