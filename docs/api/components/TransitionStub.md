## TransitionStub

A component to stub the `transition` component. Instead of performing transitions asynchronously, it returns the child component synchronously.

This is set to stub all `transition` components by default in the Vue Test Utils config. To use the built-in `transition` component set `config.stubs.transition` to false:

```js
import { config } from '@vue/test-utils'

config.stubs = { 
  transition: false
}
```

To reset it to stub `transition` components:
```js
import { config, TransitionStub } from '@vue/test-utils'

config.stubs = { 
  transition: TransitionStub
}
```

To set it as a stub in mounting options:

```js
import { mount, TransitionStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    transition: TransitionStub
  }
})
```
