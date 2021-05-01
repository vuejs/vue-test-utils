## text

Renvoie le contenu textuel de `Wrapper`.

- **Retours:** `{string}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.text()).toBe('bar')
```
