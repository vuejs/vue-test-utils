# `hasProp(prop, value)`

断言 `WrapperArray` 中的每个 `Wrapper` `vm` 都有 `prop` 属性值匹配 `value`。

**注意：该包裹器必须包含一个 Vue 示例。**

- **参数：**
  - `{string} prop`
  - `{any} value`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).toBe(true)
```
