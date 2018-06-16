## setValue(value)

Sets the value to an input element of type text.

`textInput.setValue(value)` is an alias of the following code.

```js
textInput.element.value = value
textInput.trigger('input')
```

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
