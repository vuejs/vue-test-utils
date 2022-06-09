## O método html

Returns HTML of `Wrapper` DOM node as a string.
Retorna o HTML do nó do DOM do `Wrapper` como uma sequência de caracteres (string).

- **Retorna:** `{string}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
