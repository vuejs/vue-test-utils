## findAll

::: warning Deprecation warning
Using `findAll` to search for Components is deprecated and will be removed. Use `findAllComponents` instead.
The `findAll` method will continue to work for finding elements using any valid [selector](../selectors.md).
:::

Returns a [`WrapperArray`](../wrapper-array/).

Use any valid [selector](../selectors.md).

- **Arguments:**

  - `{string|Component} selector`

- **Returns:** `{WrapperArray}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)

const bar = wrapper.findAll(Bar).at(0) // Deprecated usage
expect(bar.is(Bar)).toBe(true)
```
