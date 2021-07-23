## classes

Retourne les classes de nœuds DOM `Wrapper`.

Retourne un tableau de noms de classes ou un booléen si un nom de classe est fourni.

- **Arguments:**

  - `{string} className` **facultatif**

- **Retours:** `Array<{string}> | boolean`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
expect(wrapper.classes('bar')).toBe(true)
```
