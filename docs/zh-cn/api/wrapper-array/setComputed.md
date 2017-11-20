# `setComputed(computedObjects)`

为 `WrapperArray` 的每个 `Wrapper` `vm` 都设置计算属性并强行更新。

**注意：该包裹器必须包含一个 Vue 示例。**
**注意：每个 Vue 示例必须已经有被传入 `setComputed` 的计算属性。**

- **参数：**
  - `{Object} computed properties`

- **示例：**

```js
import { mount } from 'vue-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setComputed({
  computed1: 'new-computed1',
  computed2: 'new-computed2'
})
```
