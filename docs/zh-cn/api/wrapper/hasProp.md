# `hasProp(prop, value)`

断言 `Wrapper` `vm` 有匹配的属性值。

如果 `Wrapper` `vm` 有属性 `prop` 并且其属性值匹配 `value` 则返回 `true`。

**注意：该包裹器必须包含一个 Vue 示例。**

- **参数：**
  - `{string} prop`
  - `{any} value`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).toBe(true)
```
