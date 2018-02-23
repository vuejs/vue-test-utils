# `is(selector)`

断言 `Wrapper` DOM 节点或 `vm` 匹配[选择器](../selectors.md)。

- **参数：**
  - `{string|Component} selector`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
