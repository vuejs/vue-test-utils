# `hasAttribute(attribute, value)`

断言 `WrapperArray` 中的每个 `Wrapper` 的 DOM 节点都有 `attribute` 特性的值匹配 `value`。

- **参数：**
  - `{string} attribute`
  - `{string} value`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).toBe(true)
```
