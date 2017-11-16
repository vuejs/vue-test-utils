# TransitionStub

A component to stub the `transition` wrapper component. Instead of performing transitions asynchronously, it returns the child component synchronously.

This is set to stub all `transition` components by default in the vue-test-utils config. To use the built-in `transition` wrapper component set `config.stubs.transition` to false:

```js
import VueTestUtils from 'vue-test-utils'

VueTestUtils.config.stubs.transition = false
```

To reset it to stub transition components:
```js
import VueTestUtils, { TransitionStub } from 'vue-test-utils'

VueTestUtils.config.stubs.transition = TransitionStub
```

To set it as a stub in mounting options:

```js
import { mount, TransitionStub } from 'vue-test-utils'

mount(Component, {
  stubs: {
    transition: TransitionStub
  }
})
```
