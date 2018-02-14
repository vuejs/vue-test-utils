# `RouterLinkStub`

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
