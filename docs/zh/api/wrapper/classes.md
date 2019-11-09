## classes

返回 `Wrapper` DOM 节点的 class。

返回 class 名称的数组。或在提供 class 名的时候返回一个布尔值。

- **参数：**

  - `{string} className` **可选的**

- **返回值：**`Array<{string}> | boolean`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
expect(wrapper.classes('bar')).toBe(true)
```
