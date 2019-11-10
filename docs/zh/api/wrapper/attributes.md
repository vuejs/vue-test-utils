## attributes

返回 `Wrapper` DOM 节点的特性对象。如果提供了 `key`，则返回这个 `key` 对应的值。

- **参数：**

  - `{string} key` **可选的**

- **返回值：**`{[attribute: string]: any} | string`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
expect(wrapper.attributes('id')).toBe('foo')
```
