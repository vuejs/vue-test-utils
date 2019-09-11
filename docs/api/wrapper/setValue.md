## setValue

Sets value of a text-control input or select element and updates `v-model` bound data.

- **Arguments:**

  - `{any} value`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)

const textInput = wrapper.find('input[type="text"]')
textInput.setValue('some value')

const select = wrapper.find('select')
select.setValue('option value')
```

- **Note:**

  - `textInput.setValue(value)` is an alias of the following code.

  ```js
  textInput.element.value = value
  textInput.trigger('input')
  ```

  - `select.setValue(value)` is an alias of the following code.

  ```js
  select.element.value = value
  select.trigger('change')
  ```
