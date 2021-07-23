## html

Renvoie le HTML du nœud DOM `Wrapper` sous forme de chaîne.

- **Retours:** `{string}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
