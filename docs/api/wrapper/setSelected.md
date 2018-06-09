## setSelected(value)

Sets a specified `<option>` as selected in a `<select>`.

- **Arguments:**
  - `{Boolean} selected`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const options = wrapper.find('select').findAll('option')

options.at(1).setSelected()
expect(wrapper.text()).to.contain('option1')
```
