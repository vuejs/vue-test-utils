## setSelected(value)

Устанавливает указанный `<option>` как выбранный в `<select>`.

- **Аргументы:**
  - `{Boolean} selected`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const options = wrapper.find('select').findAll('option')

options.at(1).setSelected()
expect(wrapper.text()).to.contain('option1')
```