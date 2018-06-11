## setSelected(value)

在一个 `<select>` 中选中某个特定的 `<option>`。

- **参数：**
  - `{Boolean} selected`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const options = wrapper.find('select').findAll('option')

options.at(1).setSelected()
expect(wrapper.text()).to.contain('option1')
```
