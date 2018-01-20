# visible()

Assert every `Wrapper` in `WrapperArray` is visible.

Returns false if at least one ancestor element has `display: none` or `visibility: hidden` style.

This can be used to assert that a component is hidden by `v-show`.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.visible()).toBe(true)
expect(wrapper.findAll('.is-not-visible').visible()).toBe(false)
expect(wrapper.findAll('.is-visible').visible()).toBe(true)
```
