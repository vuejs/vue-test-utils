## setValue(value)

Sets the value of a text `<input>`.

- **Arguments:**
  - `{String} value`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const input = wrapper.find('input[type="text"]')
input.setValue('some value')
```
