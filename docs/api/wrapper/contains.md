## contains

::: warning Deprecation warning
Using `contains` is deprecated and will be removed in future releases. Use [`find`](./find.md) for DOM nodes (using `querySelector` syntax), [`findComponent`](./findComponent.md) for components, or [`wrapper.get`](./get.md) instead.
:::

Assert `Wrapper` contains an element or component matching [selector](../selectors.md).

- **Arguments:**

  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).toBe(true)
expect(wrapper.contains(Bar)).toBe(true)
```

- **See also:** [selectors](../selectors.md)
