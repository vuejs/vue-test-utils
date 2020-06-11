## at

返回第 `index` 个传入的 `Wrapper` 。数字从 0 开始计数 (比如第一个项目的索引值是 0)。如果 `index` 是负数，则从最后一个元素往回计数 (比如最后一个项目的索引值是 -1)。

- **参数：**

  - `{number} index`

- **返回值：**`{Wrapper}`

- **示例：**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const divArray = wrapper.findAll('div')

const secondDiv = divArray.at(1)
expect(secondDiv.is('div')).toBe(true)

const lastDiv = divArray.at(-1)
expect(lastDiv.is('div')).toBe(true)
```
