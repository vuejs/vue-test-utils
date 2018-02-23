# `hasClass(className)`

断言每个 `WrapperArray` 中的 `Wrapper` 的 DOM 节点都包含名为 `className` 的 class。

- **参数：**
  - `{string} className`

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasClass('bar')).toBe(true)
```
