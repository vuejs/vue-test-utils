## isVueInstance

::: warning Deprecation warning
`isVueInstance` is deprecated and will be removed in future releases.

Tests relying on the `isVueInstance` assertion provide little to no value. We suggest replacing them with purposeful assertions.

To keep these tests, a valid replacement for `isVueInstance()` is a truthy assertion of `wrapper.find(...).vm`.
:::

Assert `Wrapper` is Vue instance.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
```
