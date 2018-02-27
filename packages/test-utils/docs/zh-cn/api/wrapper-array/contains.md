# `contains(selector)`

断言 `WrapperArray` 的每个包裹器都包含选择器。

可使用任何有效的[选择器](../selectors.md)。

- **参数：**
  - `{string|Component} selector`

- **返回值：**`{boolean}`

- **示例：**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
