# TransitionGroupStub

A component to stub the `transition-group` wrapper component. Instead of performing transitions asynchronously, it returns the child components synchronously.

This is set to stub all `transition-group` components by default in the `vue-test-utils` config. To use the built-in `transition-group` wrapper component set `config.stubs['transition-group']` to false:

```js
import VueTestUtils from 'vue-test-utils'

VueTestUtils.config.stubs['transition-group'] = false
```

To reset it to stub transition components:

```js
import VueTestUtils, { TransitionGroupStub } from 'vue-test-utils'

VueTestUtils.config.stubs['transition-group'] = TransitionGroupStub
```

To set it as a stub in mounting options:

```js
import { mount, TransitionGroupStub } from 'vue-test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```
