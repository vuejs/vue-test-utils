# `name()`

如果 `Wrapper` 包含一个 Vue 示例则返回组件名，否则返回 `Wrapper` DOM 节点的标签名。

- **返回值：**`{string}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
