## setSelected

选择一个 option 元素并更新 `v-model` 绑定的数据。

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const options = wrapper.find('select').findAll('option')

options.at(1).setSelected()
```

- **注意：**

当你尝试通过 `option.element.selected = true; arentSelect.trigger('input')` 经由 `v-model` 向 state 设置值的时候，`v-model` 不会被触发。`v-model` 是被 `change` 事件触发的。

`option.setSelected()` 是接下来这段代码的别名。

```js
option.element.selected = true
parentSelect.trigger('change')
```
