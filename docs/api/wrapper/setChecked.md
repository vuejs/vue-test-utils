## setChecked(value)

Sets the value of a radio or checkbox `<input`>.

- **Arguments:**
  - `{Boolean} selected`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const option = wrapper.find('input[type="radio"]')
option.setChecked()
```

