# Components

Vue Test Utils includes utility components you can use to stub components.

## RouterLinkStub

A component to stub the Vue Router `router-link` component.

You can use this component to find a router-link component in the render tree.

- **Usage:**

To set it as a stub in mounting options:

```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  stubs: {
    RouterLink: RouterLinkStub
  }
})
expect(wrapper.find(RouterLinkStub).props().to).toBe('/some/path')
```

## TransitionStub

A component to stub the `transition` component. Instead of performing transitions asynchronously, it returns the child component synchronously.

This is set to stub all `transition` components by default in the Vue Test Utils config. To use the built-in `transition` component set `config.stubs.transition` to false:

```js
import { config } from '@vue/test-utils'

config.stubs.transition = false
```

To reset it to stub `transition` components:
```js
import { config, TransitionStub } from '@vue/test-utils'

config.stubs.transition = TransitionStub
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

## TransitionGroupStub

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