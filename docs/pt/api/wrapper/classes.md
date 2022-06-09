## O método classes

Retorna o `Wrapper` de classes do nó do DOM.

Retorna um `Array` de nomes de classes ou um booleano se um nome de classe for fornecido.

- **Argumentos:**

  - `{string} className` **opcional**

- **Retorna:** `Array<{string}> | boolean`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
expect(wrapper.classes('bar')).toBe(true)
```
