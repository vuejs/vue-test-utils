# `isVueInstance()`

断言 `Wrapper` 是 Vue 示例。

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
 ```
