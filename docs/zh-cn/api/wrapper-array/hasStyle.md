# `hasStyle(style, value)`

断言 `WrapperArray` 中的每一个 `Wrapper` 的 DOM 节点都有样式的匹配值。

如果 `Wrapper` 的 DOM 节点有 `style` 样式值匹配 `string` 则返回 `true`。

**注意：当运行在 `jsdom` 中的时候只会匹配内联样式。**

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
const divArray = wrapper.findAll('div')
expect(divArray.hasStyle('color', 'red')).toBe(true)
```
