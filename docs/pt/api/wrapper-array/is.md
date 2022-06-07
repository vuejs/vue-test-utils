## O método is

Afirma que todo `Wrapper` dentro do nó do DOM de `WrapperArray`ou `vm` corresponde a um [seletor](../selectors.md).

- **Argumentos:**

  - `{string|Component} selector`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.is('div')).toBe(true)
```
