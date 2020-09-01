## isVisible

Assert `Wrapper` is visible.

Returns `false` if an ancestor element has `display: none`, `visibility: hidden`, `opacity :0` style, is located inside collapsed `<details>` tag or has `hidden` attribute.

This can be used to assert that a component is hidden by `v-show`.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
