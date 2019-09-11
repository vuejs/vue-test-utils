## setChecked

Sets checked value for input element of type checkbox or radio and updates `v-model` bound data.

- **Arguments:**

  - `{Boolean} checked (default: true)`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const radioInput = wrapper.find('input[type="radio"]')
radioInput.setChecked()
```

- **Note:**

When you try to set the value to state via `v-model` by `radioInput.element.checked = true; radioInput.trigger('input')`, `v-model` is not triggered. `v-model` is triggered by `change` event.

`checkboxInput.setChecked(checked)` is an alias of the following code.

```js
checkboxInput.element.checked = checked
checkboxInput.trigger('click')
checkboxInput.trigger('change')
```
