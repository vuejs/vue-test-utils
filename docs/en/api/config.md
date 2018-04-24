# Config

Vue Test Utils includes a config object to defined options used by Vue Test Utils.

## Vue Test Utils Config Options

### `stubs`

- type: `Object`
- default: `{
  transition: TransitionStub,
  'transition-group': TransitionGroupStub
}`

The stub stored in `config.stubs` is used by default.  
Stubs to use in components. These are overwritten by `stubs` passed in the mounting options.

When passing `stubs` as an array in the mounting options, `config.stubs` are converted to an array, and will stub components with a basic component that returns `<!---->`.

Example:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['my-component'] = '<div />'
```

### `mocks`

- type: `Object`
- default: `{}`

Like `stubs`, the values passed to `config.mocks` are used by default. Any values passed to the mounting options `mocks` object will take priority over the ones declared in `config.mocks`.

Example:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

### `methods`

- type: `Object`
- default: `{}`

You can configure default methods using the `config` object. This can be useful for plugins that inject methods to components, like [VeeValidate](https://vee-validate.logaretm.com/). You can override methods set in `config` by passing `methods` in the mounting options.

Example:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.methods['errors'] = () => {
  any: () => false
}
```

### `provide`

- type: `Object`
- default: `{}`

Like `stubs` or `mocks`, the values passed to `config.provide` are used by default. Any values passed to the mounting options `provide` object will take priority over the ones declared in `config.provide`. **Please take note that it is not supported to pass a function as `config.provide`.**

Example:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```
