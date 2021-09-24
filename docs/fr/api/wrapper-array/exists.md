## exists

Vérifie que `WrapperArray` existe.

Renvoie false si elle est appelée sur un `WrapperArray` sans objets `Wrapper`, ou si l'un d'entre eux n'existe pas.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.findAll('div').exists()).toBe(true)
expect(wrapper.findAll('does-not-exist').exists()).toBe(false)
```
