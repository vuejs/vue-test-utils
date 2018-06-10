## setChecked(value)

设置一个 `<input>` 单选框或复选框的值。

- **参数：**
  - `{Boolean} selected`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const option = wrapper.find('input[type="radio"]')
option.setChecked()
```
