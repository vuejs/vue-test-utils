## Usage Without a Build Step

While it is common to build Vue applications using tools [Webpack](https://webpack.js.org/) to bundle the application, `vue-loader` to leverage Single File Components, and [Jest](https://jestjs.io/) to write expressive tests, it is possible to use Vue Test Utils with much less. The minimal requirements for Vue Test Utils, aside from the library itself are:

- Vue
- vue-template-compiler
- a DOM (be it [jsdom](https://github.com/jsdom/jsdom) in a Node environment, or the DOM in a real browser)

In this example, we will demonstrate how to write a simple test using nothing but the minimal dependencies described above. The final code can be found [here](https://github.com/lmiller1990/vue-test-utils-node-basic).

## Installing the Dependencies

We need to install some dependencies, as explained above: `npm install vue vue-template-complier jsdom jsdom-global @vue/test-utils`. No test runner or bundler is needed for this example.

## Requiring the Libraries

Now we need to require the libraries. There is a slight caveat, explained in a comment, and in depth below the snippet.

```js
// jsdom-global must be required before vue-test-utils,
// because vue-test-utils expects a DOM (real DOM, or JSDOM)
// to exist.
require('jsdom-global')()

const assert = require('assert')

const Vue = require('vue')
const VueTestUtils = require('@vue/test-utils')
```

As the comment says, `jsdom-global` must be required before `@vue/test-utils`. This is because Vue Test Utils expects a DOM to be present to render the Vue components. If you are running the tests in a real browser, you will not need `jsdom` at all. `Vue` must also be required before `@vue/test-utils` for obvious reasons - Vue Test Utils expects to be available, as well. We also require `assert` from the node standard library. Normally we would use the matchers provided by a test runner, often in the format of an `expect(...).toEqual(...)` assertion, but `assert` will serve this purpose for this example.

## Writing a Test

Now everything is set up, all we need is a component and a test. To keep things simple, we will just render some text and assert it is present in the rendered component.

```js
const App = Vue.component('app', {
  data() {
    return {
      msg: 'Hello Vue Test Utils'
    }
  },

  template: `
    <div>{{ msg }}</div>
  `
})

const wrapper = VueTestUtils.shallowMount(App)

assert.strictEqual('Hello Vue Test Utils', wrapper.text())
```

It's as simple as it looks. Since we do not have a build step, we cannot use Single File Components. There is nothing to stop us using Vue in the same style you would when including it from a CDN via a `<script>` tag, however.
