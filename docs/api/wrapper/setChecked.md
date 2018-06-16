## setChecked(checked)

Sets the value to an input element of type checkbox or an input element of type radio.

When you try to set the value to state via `v-model` by `radioInput.element.checked = true; radioInput.trigger('input')`, `v-model` is not triggered. `v-model` is triggered by `change` event.

`checkboxInput.setChecked(checked)` is an alias of the following code.

```js
checkboxInput.element.checked = checked
checkboxInput.trigger('click')
checkboxInput.trigger('change')
```

- **Arguments:**
  - `{Boolean} checked (default: true)`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const option = wrapper.find('input[type="radio"]')
option.setChecked()
```

