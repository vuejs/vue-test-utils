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
