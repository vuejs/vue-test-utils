# `filter(predicate)`

用一个针对 `Wrapper` 的断言函数过滤 `WrapperArray`。

该方法的行为和 [Array.prototype.filter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) 相同。

- **参数：**
  - `{function} predicate`

- **返回值：** `{WrapperArray}`

一个新的 `WrapperArray` 实例，该实例包含了经过断言函数处理后返回真值的 `Wrapper` 实例。

- **示例：**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const filteredDivArray = wrapper.findAll('div').filter(w => !w.hasClass('filtered'))
```
