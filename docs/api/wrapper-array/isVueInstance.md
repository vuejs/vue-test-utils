## isVueInstance

::: warning Deprecation warning
`isVueInstance` is deprecated and will be removed in future releases.

Tests relying on the `isVueInstance` assertion provide little to no value. We suggest replacing them with purposeful assertions.

To keep these tests, a valid replacement for `isVueInstance()` is a truthy assertion of `wrapper.find(...).vm`.
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
