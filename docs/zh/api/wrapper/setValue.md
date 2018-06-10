## setValue(value)

设置一个 `<input>` 文本的值。

- **参数：**
  - `{String} value`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const input = wrapper.find('input[type="text"]')
input.setValue('some value')
```
