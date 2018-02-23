# `attributes()`

返回 `Wrapper` DOM 节点的特性对象。

- **返回值：**`{[attribute: string]: any}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
```
