## setValue(value)

Sets value of a text-control input element and updates `v-model` bound data.

- **Arguments:**
  - `{any} value`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const input = wrapper.find('input[type="text"]')
input.setValue('some value')
```

- **Note:**

`textInput.setValue(value)` is an alias of the following code.

```js
textInput.element.value = value
textInput.trigger('input')
```
