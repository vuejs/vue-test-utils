## setValue(value)

Sets value of a text-control input or select element and updates `v-model` bound data.

- **Arguments:**
  - `{any} value`

- **Example with input:**

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

- **Example with select:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const select = wrapper.find('select')
select.setValue('optionA')
```

- **Note:**

`select.setValue(value)` is an alias of the following code.

```js
select.element.value = value
select.trigger('change')
```
