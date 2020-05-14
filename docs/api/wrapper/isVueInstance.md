## isVueInstance

::: warning Deprecation warning
`isVueInstance` is deprecated and will be removed in future releases.

Most of the times, tests relying on `isVueInstance` provide little to no-value so you could simply remove them.

If you want to keep these tests, a valid replacement is to assert that `wrapper.find(...).vm` exists.
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
