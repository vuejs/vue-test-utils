# `isVueInstance()`

断言 `WrapperArray` 的每个 `Wrapper` 都是 Vue 示例。

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).toBe(true)
```
