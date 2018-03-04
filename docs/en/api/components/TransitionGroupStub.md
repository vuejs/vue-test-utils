# `TransitionGroupStub`

A component to stub the `transition-group` component. Instead of performing transitions asynchronously, it returns the child components synchronously.

This is set to stub all `transition-group` components by default in the Vue Test Utils config. To use the built-in `transition-group`  component set `config.stubs['transition-group']` to false:

```js
import { config } from '@vue/test-utils'

config.stubs['transition-group'] = false
```

To reset it to stub `transition-group` components:

```js
import { config, TransitionGroupStub } from '@vue/test-utils'

config.stubs['transition-group'] = TransitionGroupStub
```

To set it as a stub in mounting options:

```js
import { mount, TransitionGroupStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```
