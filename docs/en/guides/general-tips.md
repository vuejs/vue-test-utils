# General Tips

## Browser Environment

`vue-test-utils` relies on a browser environment. Technically you can run it in a real browser, but it's not recommended due to the complexity of launching real browsers on different platforms. Instead, we recommend running the tests in Node.js with a virtual browser environment using [JSDOM](https://github.com/tmpvar/jsdom).

The Jest test runner sets up JSDOM automatically. For other test runners, you can manually set up JSDOM for the tests using [jsdom-global](https://github.com/rstacruz/jsdom-global) in the entry for your tests:

``` bash
npm install --save-dev jsdom jsdom-global
```
---
``` js
// in test setup / entry
require('jsdom-global')()
```

## Testing Components that Rely on Global Plugins and Mixins

Some of the components may rely on features injected by a global plugin or mixin, for example `vuex` and `vue-router`.

If you are writing tests for components in a specific app, you can setup the same global plugins and mixins once in the entry of your tests. But in some cases, for example testing a generic component suite that may get shared across different apps, it's better to test your components in a more isolated setup, without polluting the global `Vue` constructor. We can use the [createLocalVue](../api/createLocalVue.md) method to achieve that:

``` js
import createLocalVue from 'vue-test-utils'

// create an extended Vue constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(MyPlugin)

// pass the localVue to the mount options
mount(Component, {
  localVue
})
```
