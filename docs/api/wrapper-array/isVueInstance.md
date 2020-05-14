## isVueInstance

::: warning Deprecation warning
`isVueInstance` is deprecated and will be removed in future releases.

Most of the times, tests relying on `isVueInstance` provide little to no-value so you could simply remove them.

If you want to keep these tests, a valid replacement is to assert that `wrapper.find(...).vm` exists.
:::

Assert every `Wrapper` in `WrapperArray` is Vue instance.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).toBe(true)
```
