# `text()`

返回 `Wrapper` 的文本内容。

- **返回值：**`{string}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.text()).toBe('bar')
```
