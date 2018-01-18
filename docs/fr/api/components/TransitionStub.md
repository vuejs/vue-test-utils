# TransitionStub

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>A component to stub the `transition` component. Instead of performing transitions asynchronously, it returns the child component synchronously.</p>

This is set to stub all `transition` components by default in the vue-test-utils config. To use the built-in `transition` component set `config.stubs.transition` to false:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs.transition = false
```

To reset it to stub `transition` components:
```js
import VueTestUtils, { TransitionStub } from '@vue/test-utils'

VueTestUtils.config.stubs.transition = TransitionStub
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
