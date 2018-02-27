# `hasClass(className)`

断言 `Wrapper` DOM 节点包含一个 class 名。

如果 `Wrapper` DOM 节点包含名为 `className` 的 class 则返回 `true`。

- **参数：**
  - `{string} className`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).toBe(true)
```
