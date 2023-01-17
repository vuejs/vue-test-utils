## findAllComponents

Returns a [`WrapperArray`](../wrapper-array/) of all matching Vue components.

- **Arguments:**

  - `selector` Use any valid [selector](../selectors.md)

- **Returns:** `{WrapperArray}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.findAllComponents(Bar).at(0)
expect(bar.exists()).toBeTruthy()
const bars = wrapper.findAllComponents(Bar)
expect(bars).toHaveLength(1)
```

::: warning Usage with CSS selectors
Using `findAllComponents` with CSS selector is subject to same limitations as [findComponent](./findComponent.md)
:::
