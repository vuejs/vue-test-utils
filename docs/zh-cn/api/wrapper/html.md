# `html()`

返回 `Wrapper` DOM 节点的 HTML 字符串。

- **返回值：**`{string}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
