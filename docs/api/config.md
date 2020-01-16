## Config

Vue Test Utils includes a config object to defined options used by Vue Test Utils.

### Vue Test Utils Config Options

### `stubs`

- type: `{ [name: string]: Component | boolean | string }`
- default: `{}`

The stub stored in `config.stubs` is used by default.  
Stubs to use in components. These are overwritten by `stubs` passed in the mounting options.

When passing `stubs` as an array in the mounting options, `config.stubs` are converted to an array, and will stub components with a basic component that returns `<${component name}-stub>`.

Example:

```js
import { config } from '@vue/test-utils'

config.stubs['my-component'] = '<div />'
```

### `mocks`

- type: `Object`
- default: `{}`

Like `stubs`, the values passed to `config.mocks` are used by default. Any values passed to the mounting options `mocks` object will take priority over the ones declared in `config.mocks`.

Example:

```js
import { config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

### `methods`

- type: `{ [name: string]: Function }`
- default: `{}`

You can configure default methods using the `config` object. This can be useful for plugins that inject methods to components, like [VeeValidate](https://vee-validate.logaretm.com/). You can override methods set in `config` by passing `methods` in the mounting options.

Example:

```js
import { config } from '@vue/test-utils'

config.methods['getData'] = () => {}
```

### `provide`

- type: `Object`
- default: `{}`

Like `stubs` or `mocks`, the values passed to `config.provide` are used by default. Any values passed to the mounting options `provide` object will take priority over the ones declared in `config.provide`. **Please take note that it is not supported to pass a function as `config.provide`.**

Example:

```js
import { config } from '@vue/test-utils'

config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```

### `silent`

- type: `Boolean`
- default: `true`

It suppresses warnings triggered by Vue while mutating component's observables (e.g. props). When set to `false`, all warnings are visible in the console. This is a configurable way which relies on `Vue.config.silent`.

Example:

```js
import { config } from '@vue/test-utils'

config.silent = false
```
