# TransitionGroupStub

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>A component to stub the `transition-group` component. Instead of performing transitions asynchronously, it returns the child components synchronously.</p>

This is set to stub all `transition-group` components by default in the `vue-test-utils` config. To use the built-in `transition-group`  component set `config.stubs['transition-group']` to false:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['transition-group'] = false
```

To reset it to stub `transition-group` components:

```js
import VueTestUtils, { TransitionGroupStub } from '@vue/test-utils'

VueTestUtils.config.stubs['transition-group'] = TransitionGroupStub
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
