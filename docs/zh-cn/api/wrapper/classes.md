# `classes()`

返回 `Wrapper` DOM 节点的 class。

返回 class 名称的数组。

- **返回值：**`Array<{string}>`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
```
