# `hasStyle(style, value)`

断言 `Wrapper` DOM 节点有匹配的样式值。

如果 `Wrapper` DOM 节点有 `style` 属性值为 `value` 则返回 `true`。

**注意：当运行在 `jsdom` 中时只会检测内联样式。**

- **参数：**
  - `{string} style`
  - `{string} value`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasStyle('color', 'red')).toBe(true)
```
