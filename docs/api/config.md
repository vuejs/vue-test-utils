## Config

Vue Test Utils includes a config object to defined options used by Vue Test Utils.

### Vue Test Utils Config Options

### `showDeprecationWarnings`

- type: `Boolean`
- default: `true`

Control whether or not to show deprecation warnings. When set to `true`, all deprecation warnings are visible in the console.

Example:

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = false
```

### `deprecationWarningHandler`

- type: `Function`

Allows fine-grained control on deprecation warnings. When `showDeprecationWarnings` is set to `true`, all deprecation warnings will be passed to this handler with method name as first argument and original message as second.

::: tip
This could be useful to log deprecation messages to separate location or to help in gradual upgrade of codebase to latest version of test utils by ignoring certain deprecated functions warnings
:::

Example:

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = true
config.deprecationWarningHandler = (method, message) => {
  if (method === 'emittedByOrder') return

  console.error(msg)
}
```

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

You can configure default methods using the `config` object. This can be useful for plugins that inject methods to components, like [VeeValidate](https://logaretm.github.io/vee-validate/). You can override methods set in `config` by passing `methods` in the mounting options.

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
